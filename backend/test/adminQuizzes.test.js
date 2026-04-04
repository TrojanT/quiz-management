const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const app = require('../server');
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Quiz = require('../models/Quiz');
const Category = require('../models/Category');
const {
  getQuiz,
  listQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} = require('../controllers/quizController');
const { expect } = chai;

chai.use(chaiHttp);
let server;
let port;

describe('CreateQuiz (admin) function test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return 400 if title is missing', async () => {
    const req = {
      body: {
        questionCount: 0,
        duration: 10,
        status: 'active',
        categoryId: new mongoose.Types.ObjectId().toString(),
      },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await createQuiz(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Title is required' })).to.be.true;
  });

  it('should return 400 if category is missing', async () => {
    const req = {
      body: { title: 'Quiz A', duration: 10, status: 'active' },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await createQuiz(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Category is required' })).to.be.true;
  });

  it('should return 400 if category does not exist', async () => {
    const findCatStub = sinon.stub(Category, 'findById').resolves(null);

    const req = {
      body: {
        title: 'Quiz A',
        categoryId: new mongoose.Types.ObjectId().toString(),
        duration: 10,
        status: 'active',
      },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await createQuiz(req, res);

    expect(findCatStub.calledOnce).to.be.true;
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Invalid category' })).to.be.true;
  });

  it('should return 400 if duration is invalid', async () => {
    sinon.stub(Category, 'findById').resolves({ _id: new mongoose.Types.ObjectId() });

    const req = {
      body: {
        title: 'Quiz A',
        categoryId: new mongoose.Types.ObjectId().toString(),
        duration: 0,
        status: 'active',
      },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await createQuiz(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Duration must be at least 1 minute' })).to.be.true;
  });

  it('should return 400 if status is invalid', async () => {
    sinon.stub(Category, 'findById').resolves({ _id: new mongoose.Types.ObjectId() });

    const req = {
      body: {
        title: 'Quiz A',
        categoryId: new mongoose.Types.ObjectId().toString(),
        duration: 10,
        status: 'draft',
      },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await createQuiz(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Status must be active or inactive' })).to.be.true;
  });

  it('should create a quiz successfully', async () => {
    const catId = new mongoose.Types.ObjectId();
    sinon.stub(Category, 'findById').resolves({ _id: catId });

    const quizOid = new mongoose.Types.ObjectId();
    const createStub = sinon.stub(Quiz, 'create').resolves({ _id: quizOid });

    const populated = {
      quizId: 42,
      title: 'New Quiz',
      questionCount: 2,
      status: 'active',
      duration: 15,
      category: { name: 'Science', _id: catId },
    };
    const chain = {
      populate: sinon.stub().returnsThis(),
      lean: sinon.stub().resolves(populated),
    };
    sinon.stub(Quiz, 'findById').withArgs(quizOid).returns(chain);

    const req = {
      body: {
        title: 'New Quiz',
        questionCount: 2,
        duration: 15,
        status: 'active',
        categoryId: catId.toString(),
      },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await createQuiz(req, res);

    expect(createStub.calledOnce).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    const payload = res.json.firstCall.args[0];
    expect(payload).to.include({ id: 42, title: 'New Quiz', status: 'active' });
  });

  it('should return 500 if an error occurs', async () => {
    sinon.stub(Category, 'findById').resolves({ _id: new mongoose.Types.ObjectId() });
    sinon.stub(Quiz, 'create').throws(new Error('DB Error'));

    const req = {
      body: {
        title: 'Quiz',
        categoryId: new mongoose.Types.ObjectId().toString(),
        duration: 10,
        status: 'active',
      },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await createQuiz(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});

describe('GetQuiz (admin) function test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return 400 if quiz id param is not an integer', async () => {
    const req = { params: { id: 'abc' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await getQuiz(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Invalid quiz id' })).to.be.true;
  });

  it('should return 404 if quiz is not found', async () => {
    const chain = {
      populate: sinon.stub().returnsThis(),
      lean: sinon.stub().resolves(null),
    };
    sinon.stub(Quiz, 'findOne').returns(chain);

    const req = { params: { id: '99' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await getQuiz(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Quiz not found' })).to.be.true;
  });

  it('should return quiz json successfully', async () => {
    const catId = new mongoose.Types.ObjectId();
    const leanDoc = {
      quizId: 7,
      title: 'Sample',
      questionCount: 3,
      status: 'active',
      duration: 20,
      category: { _id: catId, name: 'Math' },
    };
    const chain = {
      populate: sinon.stub().returnsThis(),
      lean: sinon.stub().resolves(leanDoc),
    };
    sinon.stub(Quiz, 'findOne').withArgs({ quizId: 7 }).returns(chain);

    const req = { params: { id: '7' } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis(),
    };

    await getQuiz(req, res);

    expect(res.json.calledOnce).to.be.true;
    expect(res.status.called).to.be.false;
    expect(res.json.firstCall.args[0]).to.deep.include({
      id: 7,
      title: 'Sample',
      questionCount: 3,
      status: 'active',
      duration: 20,
      categoryId: catId.toString(),
    });
  });

  it('should return 500 on error', async () => {
    const chain = {
      populate: sinon.stub().returnsThis(),
      lean: sinon.stub().rejects(new Error('DB Error')),
    };
    sinon.stub(Quiz, 'findOne').returns(chain);

    const req = { params: { id: '1' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await getQuiz(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});

describe('ListQuizzes (admin) function test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return only quizzes with integer quizId', async () => {
    const catId = new mongoose.Types.ObjectId();
    const rows = [
      {
        quizId: 1,
        title: 'A',
        questionCount: 0,
        status: 'active',
        duration: 5,
        category: { name: 'C1', _id: catId },
        updatedAt: new Date(),
      },
      {
        quizId: null,
        title: 'Skip me',
        questionCount: 0,
        status: 'inactive',
        duration: 5,
        category: null,
        updatedAt: new Date(),
      },
    ];
    const chain = {
      populate: sinon.stub().returnsThis(),
      sort: sinon.stub().returnsThis(),
      lean: sinon.stub().resolves(rows),
    };
    sinon.stub(Quiz, 'find').returns(chain);

    const req = {};
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis(),
    };

    await listQuizzes(req, res);

    expect(res.json.calledOnce).to.be.true;
    const out = res.json.firstCall.args[0];
    expect(out).to.be.an('array').with.lengthOf(1);
    expect(out[0].id).to.equal(1);
    expect(out[0].title).to.equal('A');
  });

  it('should return 500 on error', async () => {
    const chain = {
      populate: sinon.stub().returnsThis(),
      sort: sinon.stub().returnsThis(),
      lean: sinon.stub().rejects(new Error('DB Error')),
    };
    sinon.stub(Quiz, 'find').returns(chain);

    const req = {};
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis(),
    };

    await listQuizzes(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});

describe('UpdateQuiz (admin) function test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return 400 if quiz id param is invalid', async () => {
    const req = { params: { id: 'x' }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await updateQuiz(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Invalid quiz id' })).to.be.true;
  });

  it('should return 404 if quiz is not found', async () => {
    sinon.stub(Quiz, 'findOne').resolves(null);

    const req = { params: { id: '5' }, body: { title: 'X' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await updateQuiz(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Quiz not found' })).to.be.true;
  });

  it('should return 400 if duration is invalid', async () => {
    const quizDoc = {
      _id: new mongoose.Types.ObjectId(),
      title: 'Old',
      questionCount: 0,
      duration: 10,
      status: 'inactive',
      save: sinon.stub().resolves(),
    };
    sinon.stub(Quiz, 'findOne').withArgs({ quizId: 3 }).resolves(quizDoc);

    const req = { params: { id: '3' }, body: { duration: 0 } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await updateQuiz(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Duration must be at least 1 minute' })).to.be.true;
  });

  it('should update quiz successfully', async () => {
    const catId = new mongoose.Types.ObjectId();
    const quizDoc = {
      _id: new mongoose.Types.ObjectId(),
      title: 'Old',
      questionCount: 0,
      duration: 10,
      status: 'inactive',
      category: catId,
      save: sinon.stub().resolves(),
    };
    sinon.stub(Quiz, 'findOne').withArgs({ quizId: 2 }).resolves(quizDoc);

    const populated = {
      quizId: 2,
      title: 'Updated',
      questionCount: 0,
      status: 'active',
      duration: 10,
      category: { name: 'Cat', _id: catId },
    };
    const chain = {
      populate: sinon.stub().returnsThis(),
      lean: sinon.stub().resolves(populated),
    };
    sinon.stub(Quiz, 'findById').withArgs(quizDoc._id).returns(chain);

    const req = { params: { id: '2' }, body: { title: 'Updated', status: 'active' } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis(),
    };

    await updateQuiz(req, res);

    expect(quizDoc.title).to.equal('Updated');
    expect(quizDoc.status).to.equal('active');
    expect(quizDoc.save.calledOnce).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0].title).to.equal('Updated');
  });

  it('should return 500 on error', async () => {
    sinon.stub(Quiz, 'findOne').throws(new Error('DB Error'));

    const req = { params: { id: '1' }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await updateQuiz(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});

describe('DeleteQuiz (admin) function test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return 400 if quiz id is invalid', async () => {
    const req = { params: { id: 'bad' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await deleteQuiz(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Invalid quiz id' })).to.be.true;
  });

  it('should return 404 if quiz is not found', async () => {
    sinon.stub(Quiz, 'findOneAndDelete').resolves(null);

    const req = { params: { id: '8' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await deleteQuiz(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Quiz not found' })).to.be.true;
  });

  it('should delete a quiz successfully', async () => {
    const delStub = sinon.stub(Quiz, 'findOneAndDelete').withArgs({ quizId: 4 }).resolves({ _id: 'x' });

    const req = { params: { id: '4' } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis(),
    };

    await deleteQuiz(req, res);

    expect(delStub.calledOnce).to.be.true;
    expect(res.json.calledWith({ message: 'Deleted' })).to.be.true;
  });

  it('should return 500 if an error occurs', async () => {
    sinon.stub(Quiz, 'findOneAndDelete').throws(new Error('DB Error'));

    const req = { params: { id: '1' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await deleteQuiz(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});
