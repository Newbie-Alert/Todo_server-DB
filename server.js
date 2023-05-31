// express 객체 생성
const express = require('express');
const app = express();
app.use(express.static(__dirname + '/public'));

// 서버와 통신 시 데이터를 보기 편하게 해주는 body-parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// ejs 파일의 렌더를 담당하는 ejs라이브러리 장착
app.set('view engine', 'ejs');

// MongoDB 객체 생성
const MongoClient = require('mongodb').MongoClient;
let db;

// DB 연결
MongoClient.connect('mongodb+srv://Choonsik:asdf1234@cluster0.icj0p3f.mongodb.net/?retryWrites=true&w=majority', function (err, client) {
  if (err) return console.log(err);

// todoapp DB로 연결
  db = client.db('todoapp');
  
// 8080포트에 서버를 열고, 열린 후 콘솔 창에 띄울 메세지 설정
  app.listen(8080, () => {
    console.log('listenig on 8080');
  })

// '/list'경로로 POST요청이 왔을 시 
  app.post('/list', function (req, res) {
    res.sendFile(__dirname + '/index.html')
    
    // count콜렉션에서 새로운 항목의 id가 될 [총 게시물 개수]를 가져오고
    db.collection('count').findOne({ name: '게시물 갯수' }, function (err, result) {
      let total = result.count;

      // 새로운 항목 추가 (생성되는 할 일의 고유 ID는 현재 [총 게시물 갯수 + 1])
      db.collection('tasks').insertOne({ _id: total + 1, name: req.body.task, date: req.body.date, importance: req.body.importance })

      // count컬렉션의 총 게시물 갯수에 +1 업데이트!
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

// '/list'로 GET요청 시 tasks콜렉션의 데이터를 가져와 ejs에 바인딩 하고
// 클라이언트에게 ejs파일을 출력해준다
app.get('/list', function (req, res) {
  db.collection('tasks').find().toArray(function (err, result) {
    res.render('list.ejs', { tasks: result });
    console.log(result);
  })
})

// '/delete' 요청 시 tasks콜렉션 중 삭제요청 데이터의 id와 같은 값을 찾아 DB에서 삭제
app.delete('/delete', function (req, res) {
  // 서버와 데이터 통신 시 포맷 잘 확인
  req.body._id = parseInt(req.body._id);
  db.collection('tasks').deleteOne(req.body, function (err, result) {
    res.status(200).send({ message: '삭제 성공' });
  })
})
