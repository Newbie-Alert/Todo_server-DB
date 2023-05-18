const express = require('express');
const app = express();
app.use(express.static(__dirname + '/public'));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

const MongoClient = require('mongodb').MongoClient;
let db;

MongoClient.connect('mongodb+srv://Choonsik:asdf1234@cluster0.icj0p3f.mongodb.net/?retryWrites=true&w=majority', function (err, client) {
  if (err) return console.log(err);

  db = client.db('todoapp');

  app.listen(8080, () => {
    console.log('listenig on 8080');
  })


  app.post('/list', function (req, res) {
    res.sendFile(__dirname + '/index.html')
    //새로운 항목의 id가 될 총 게시물 개수 가져옴
    db.collection('count').findOne({ name: '게시물 갯수' }, function (err, result) {
      let total = result.count;

      // 할 일 추가(고유 ID는 현재 총 게시물 갯수 + 1)
      db.collection('tasks').insertOne({ _id: total + 1, name: req.body.task, date: req.body.date, importance: req.body.importance })

      // count 데이터 +1 수정
      db.collection('count').updateOne({ name: '게시물 갯수' }, { $inc: { count: 1 } });
    })
  })
})

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})
app.get('/write', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})
// app.get('/list', function (req, res) {
//   res.sendFile(__dirname + '/list.html')
// })
app.get('/list', function (req, res) {
  db.collection('tasks').find().toArray(function (err, result) {
    res.render('list.ejs', { tasks: result });
    console.log(result);
  })
})

app.delete('/delete', function (req, res) {
  // 서버와 데이터 통신 시 포맷 잘 확인
  req.body._id = parseInt(req.body._id);
  db.collection('tasks').deleteOne(req.body, function (err, result) {
    res.status(200).send({ message: '삭제 성공' });
  })
})