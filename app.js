//Express 모듈 불러오기
var express = require("express"),
  http = require("http"),
  path = require("path");
var fs = require("fs");

// 익스프레스 미들웨어 불러오기
var bodyParser = require("body-parser"),
  cookieParser = require("cookie-parser"),
  static = require("serve-static"),
  errorHandler = require("errorhandler");

var expressErrorHandler = require("express-error-handler"); // 오류 핸들러 모듈사용
var expressSession = require("express-session"); // session 미들웨어 불러오기

var pool = require("./database/mysql-config");
var app = express(); // 익스프레스 객체 생성
var user = require("./routers/user.js");
user.init(pool);

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

// 검색기능
var searchList = function (search, callback) {
  console.log("검색 단어 : " + search);

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

    var tablename = "empl_list";

    // sql문을 실행합니다.
    var exec = conn.query(
      "delete from empl_list where enter_id = " + '"' + enter_id + '"',
      function (err, res) {
        conn.release(); // 반드시 해제해야 합니다.
        console.log("실행 대상 sql : " + exec.sql);
        console.log(" 채용공고 삭제 ");
        if (res) {
          callback(null, res);
        } else {
          callback(err, null);
        }
      }
    );
  });
};

// 라우터 객체 참조
var router = express.Router();

// 로그인 라우팅 함수 - 데이터베이스의 정보와 비교
router.route("/process/login").post(user.login);
// 채용공고 추가 라우팅 함수 - 클라이언트에서 보내온 데이터를 이용해 데이터베이스에 추가
router.route("/process/addlist").post(user.addList);
router.route("/process/listuser").post(user.listuser); //  채용공고 리스트 함수
router.route("/process/updateList").get(user.updateList);
router.route("/process/updateEmplList").post(user.updateEmplList2);
router.route("/process/deleteList").get(user.deleteList2);

router.route("/process/search").get(function (req, res) {
  var search = req.query.search;
  searchList(search, function (err, res) {});
});

// 라우터 객체 등록
app.use("/", router);

// =========== 서버 시작 ============
http.createServer(app).listen(app.get("port"), function () {
  console.log("서버가 시작되었스니다. 포트 : " + app.get("port"));
});
