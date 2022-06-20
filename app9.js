//Express 모듈 불러오기
var express = require("express"),
  http = require("http"),
  path = require("path");

// 익스프레스 미들웨어 불러오기
var bodyParser = require("body-parser"),
  cookieParser = require("cookie-parser"),
  static = require("serve-static"),
  errorHandler = require("errorhandler");

var expressErrorHandler = require("express-error-handler"); // 오류 핸들러 모듈사용
var expressSession = require("express-session"); // session 미들웨어 불러오기

var mysql = require("mysql");
const { copyFileSync } = require("fs");

var pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "1234",
  database: "hp",
  debug: false,
});

// 익스프레스 객체 생성
var app = express();

app.set("port", process.env.PORT || 3000);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(cookieParser());

// 세션 설정
app.use(
  expressSession({
    secret: "my key",
    resave: true,
    saveUninitialized: true,
  })
);

// 데이터베이스 객체를 위한 변수 선언
var database;

// 사용자를 인증하는 함수
var authUser = function (id, password, callback) {
  console.log("authUser 호출됨.");

  // 커넥션 풀에서 연결 객체를 가져옵니다.
  pool.getConnection(function (err, conn) {
    if (err) {
      if (conn) {
        conn.release(); // 반드시 해제해야 합니다.
      }
      callback(err, null);
      return;
    }
    console.log("데이터베이스 연결 스레드 아이디 : " + conn.threadId);

    var column = ["id", "name", "age"];
    var tablename = "users";

    // sql문을 실행합니다.
    var exec = conn.query(
      " select ?? from ?? where id = ? and password = ?",
      [column, tablename, id, password],
      function (err, rows) {
        conn.release(); // 반드시 해제해야 합니다.
        console.log("실행 대상 sql : " + exec.sql);

        if (rows.length > 0) {
          console.log(
            "아이디 [%s], 패스워드[%s]가 일치하는 사용자 찾음.",
            id,
            password
          );
          callback(null, rows);
        } else {
          console.log("일치하는 사용자를 찾지 못함.");
          callback(null, null);
        }
      }
    );
  });
};

// 사용자를 추가하는 함수
var addUser = function (id, name, age, password, callback) {
  console.log("addUser 호출됨.");

  // 커넥션 풀에서 연결 객체를 가져옵니다.
  pool.getConnection(function (err, conn) {
    if (err) {
      if (conn) {
        conn.release(); // 반드시 해제해야 합니다.
      }

      callback(err, null);
    }

    console.log("데이터베이스 연결 스레드 아이디 : " + conn.threadId);

    // 데이터를 객체로 만듭니다.
    var data = { id: id, name: name, age: age, password: password };

    // sql문을 실행합니다.
    var exec = conn.query(
      "insert into users set ?",
      data,
      function (err, result) {
        conn.release(); // 반드시 해제해야 합니다.
        console.log("실행 대상 SQL : " + exec.sql);

        if (err) {
          console.log("sql 실행 시 오류 발생함.");
          console.dir(err);

          callback(err, null);
          return;
        }

        callback(null, result);
      }
    );
  });
};

// 라우터 객체 참조
var router = express.Router();

// 로그인 라우팅 함수 - 데이터베이스의 정보와 비교
router.route("/process/login").post(function (req, res) {
  console.log("/process/login 호출됨.");

  // 요청 파라미터 확인
  var paramId = req.body.id || req.query.id;
  var paramPassword = req.body.password || req.query.password;

  console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword);

  // pool객체가 초기화 된 경우, 

  if (database) {
    authUser(database, paramId, paramPassword, function (err, docs) {
      if (err) {
        throw err;
      }

      if (docs) {
        console.dir(docs);
        var username = docs[0].name;
        res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>로그인 성공</h1>");
        res.write("<div><p>사용자 아이디 : <p>" + paramId + "</div>");
        res.write("<div><p>사용자 이름 : <p>" + username + "</div>");
        res.write("<br><br><a href='/login.html'>다시 로그인하기</a>");
        res.end();
      } else {
        res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>로그인 실패</h1>");
        res.write("<div><p>아이디와 비밀번호를 다시 확인하십시오.<p></div>");
        res.write("<br><br><a href='/login.html'>다시 로그인하기</a>");
        res.end();
      }
    });
  } else {
    res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
    res.write("<h1>데이터ㅔ이스 연결실패</h1>");
    res.write("<div><p>데이터베이스에 연겨하지 못했습니다.<p></div>");
    res.end();
  }
});

// 사용자 추가 라우팅 함수 - 클라이언트에서 보내온 데이터를 이용해 데이터베이스에 추가
router.route("/process/adduser").post(function (req, res) {
  console.log("/process/adduser 호출됨.");

  var paramId = req.body.id || req.query.id;
  var paramPassword = req.body.password || req.query.password;
  var paramName = req.body.name || req.query.name;
  var paramAge = req.body.age || req.query.age;

  console.log(
    "요청 파라미터 : " +
      paramId +
      ", " +
      paramPassword +
      ", " +
      paramName +
      ", " +
      paramAge
  );

  // pool객체가 초기화된 경우, addUser 함수 호출하여 사용자 추가
  if (pool) {
    addUser(
      paramId,
      paramName,
      paramAge,
      paramPassword,
      function (err, addedUser) {
        // 동일한 id로 추가할 때 오류 발생 - 클라이언트로 오류 전송
        if (err) {
          console.error("사용자 추가 중 오류 발생 : " + err.stack);
          res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
          res.write("<h2>사용자 추가중 오류 발생</h2>");
          res.write("<p>" + err.stack + "</p>");
          res.end();

          return;
        }

        // 결과 객체 있으면 성공 응답 전송
        if (addedUser) {
          console.log("inserted " + addedUser.affectedRows + " rows");

          var insertId = addedUser.insertId;
          console.log("추가한 레코드의 아이디 : " + insertId);

          res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
          res.write("<h2>사용자 추가 성공</h2>");
          res.end();
        } else {
          res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
          res.write("<h2>사용자 추가 실패</h2>");
          res.end();
        }
      }
    );
  }
});

// 라우터 객체 등록
app.use("/", router);

// =========== 서버 시작 ============
http.createServer(app).listen(app.get("port"), function () {
  console.log("서버가 시작되었스니다. 포트 : " + app.get("port"));
});
