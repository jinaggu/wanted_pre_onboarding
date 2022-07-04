var pool;

var init = (p) => {
  console.log("user js init 호출됨.");
  pool = p;
};

var authUser = function (pool, id, password, callback) {
  console.log("authUser 호출됨." + id + "/" + password);
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

// 채용리스트 list / update
var authList = function (enter_id, callback) {
  console.log("authList 호출됨.");

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

    //var column = ["id", "name", "age"];
    // var tablename = "empl_list";

    // sql문을 실행합니다.
    var exec = conn.query(
      " select * from empl_list where enter_id = ?",
      [enter_id],
      function (err, rows) {
        conn.release(); // 반드시 해제해야 합니다.
        console.log("실행 대상 sql : " + exec.sql);

        if (rows.length > 0) {
          callback(null, rows);
        } else {
          console.log("일치하는 사용자를 찾지 못함.");
          callback(null, null);
        }
      }
    );
  });
};

// 채용리스트 추가하는 함수
var addUser = function (
  enter_id,
  empl_position,
  empl_money,
  empl_context,
  use_tech,
  callback
) {
  console.log("addlist 호출됨.");

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
    var data = {
      enter_id: enter_id,
      empl_position: empl_position,
      empl_money: empl_money,
      empl_context: empl_context,
      use_tech: use_tech,
    };

    // sql문을 실행합니다.
    var exec = conn.query(
      "insert into empl_list set ?",
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

var listUser = function (callback) {
  console.log("listuser 호출됨.");

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

    var column = [
      "enter_id",
      "empl_position",
      "empl_money",
      "empl_context",
      "use_tech",
    ];
    var tablename = "empl_list";

    // sql문을 실행합니다.
    var exec = conn.query("select * from empl_list", function (err, rows) {
      conn.release(); // 반드시 해제해야 합니다.
      console.log("실행 대상 sql : " + exec.sql);

      if (rows.length > 0) {
        callback(null, rows);
      } else {
        callback(err, null);
      }
    });
  });
};

var updateEmplList = function (
  enter_id,
  empl_position,
  empl_money,
  empl_context,
  use_tech,
  callback
) {
  pool.getConnection(function (err, conn) {
    if (err) {
      if (conn) {
        conn.release(); // 반드시 해제해야 합니다.
      }
      callback(err, null);
      return;
    }
    console.log("데이터베이스 연결 스레드 아이디 : " + conn.threadId);
    var data = {
      empl_position: empl_position,
      empl_money: empl_money,
      empl_context: empl_context,
      use_tech: use_tech,
    };

    // sql문을 실행합니다.
    var exec = conn.query(
      "update empl_list set ? where enter_id =" + '"' + enter_id + '"',
      data,
      function (err, res) {
        conn.release(); // 반드시 해제해야 합니다.
        console.log("실행 대상 sql : " + exec.sql);

        if (err) {
          callback(err, null);
        }

        callback(null, res);
      }
    );
  });
};

var deleteList = function (enter_id, callback) {
  console.log("deleteList 호출됨.");

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

var login = function (req, res) {
  console.log("/process/login 호출됨.");

  // 요청 파라미터 확인
  var paramId = req.body.id || req.query.id;
  var paramPassword = req.body.password || req.query.password;

  console.log("요청 파라미터 : " + paramId + ", " + paramPassword);

  // pool객체가 초기화 된 경우,
  if (pool) {
    authUser(pool, paramId, paramPassword, function (err, docs) {
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
};

var addList = function (req, res) {
  console.log("/process/adduser 호출됨.");

  var enter_id = req.body.enter_id || req.query.enter_id;
  var empl_position = req.body.empl_position || req.query.empl_position;
  var empl_money = req.body.empl_money || req.query.empl_money;
  var empl_context = req.body.empl_context || req.query.empl_context;
  var use_tech = req.body.use_tech || req.query.use_tech;

  console.log(
    "요청 파라미터 : " +
      enter_id +
      ", " +
      empl_position +
      ", " +
      empl_money +
      ", " +
      empl_context +
      ", " +
      use_tech
  );

  // pool객체가 초기화된 경우, addUser 함수 호출하여 사용자 추가
  if (pool) {
    addUser(
      enter_id,
      empl_position,
      empl_money,
      empl_context,
      use_tech,
      function (err, addedlist) {
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
        if (addedlist) {
          console.log("inserted " + addedlist.affectedRows + " rows");

          var addedlist = addedlist.insertId;
          console.log("추가한 레코드의 아이디 : " + addedlist);

          res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
          res.write("<h2>채용공고 추가 성공</h2>");
          res.write("<a href='/listuser.html'>메인으로 돌아가기</a>");
          res.end();
        } else {
          res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
          res.write("<h2>채용공고 추가 실패</h2>");
          res.end();
        }
      }
    );
  }
};

var listuser = function (req, res) {
  console.log("/process/listuser 호출됨.");
  // pool객체가 초기화된 경우, addUser 함수 호출하여 사용자 추가
  if (pool) {
    listUser(function (err, listUser) {
      if (err) {
        console.error("유저리스트 조회 중 오류 발생 : " + err.stack);
        res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
        res.write("<h2>유저리스트 조회 중 오류 발생</h2>");
        res.write("<p>" + err.stack + "</p>");
        res.end();
        return;
      }

      // 결과 객체 있으면 성공 응답 전송
      if (listUser) {
        res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>채용 리스트</h1>");
        res.write(
          "<div><input type='text' placeholder='채용공고 검색'/><a href='/process/search'>검색하기</a></div>"
        );
        res.write("<hr/>");
        for (var i = 0; i < listUser.length; i++) {
          res.write(
            "<div><a href='/process/updateList?enter_id=" +
              listUser[i].enter_id +
              "'>채용공고 아이디 :" +
              listUser[i].enter_id +
              "</a></div>"
          );
          res.write(
            "<div><p>채용 포지션 :" + listUser[i].empl_position + "</p></div>"
          );
          res.write(
            "<div><p>채용 내용:" + listUser[i].empl_context + "</p></div>"
          );
          res.write(
            "<div><p>채용 기술 :" + listUser[i].use_tech + "</p></div>"
          );
          res.write(
            "<a href='/process/deleteList?enter_id=" +
              listUser[i].enter_id +
              "'>채용공고 삭제</a>"
          );
          res.write("<hr/>");
        }
        res.end();
      } else {
        res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
        res.write("<h2>사용자 리스트 조회 실패</h2>");

        res.end();
      }
    });
  }
};

var updateList = function (req, res) {
  var enter_id = req.query.enter_id;
  authList(enter_id, function (err, listEmpl) {
    if (listEmpl) {
      res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
      res.write("<h1>채용 리스트</h1>");
      res.write(
        "<form method='post' action='/process/updateEmplList'>" +
          "<div>회사 id : <input type='text' disabled=true name='enter_id' value=" +
          listEmpl[0].enter_id +
          ">" +
          "</div>"
      );
      res.write(
        "<div>채용 포지션 : <input type='text' name='empl_position' value=" +
          listEmpl[0].empl_position +
          ">" +
          "</div>"
      );
      res.write(
        "<div>채용 내용 :" +
          " <textarea name='empl_context' type='text'>" +
          listEmpl[0].empl_context +
          "</textarea>" +
          "</div>"
      );
      res.write(
        "<div>채용 기술 : <input type='text' name='use_tech' value=" +
          listEmpl[0].use_tech +
          ">" +
          "</div>"
      );
      res.write(
        "<div>채용 보상금 : <input type='text' name='empl_money' value=" +
          listEmpl[0].empl_money +
          ">" +
          "</div>"
      );
      res.write("<input type='submit' value='채용공고 수정'/></form>");
      res.write("<hr/>");

      res.end();
    }
  });
};

var updateEmplList2 = function (req, res) {
  var enter_id = req.body.enter_id || req.query.enter_id;
  var empl_position = req.body.empl_position || req.query.empl_position;
  var empl_money = req.body.empl_money || req.query.empl_money;
  var empl_context = req.body.empl_context || req.query.empl_context;
  var use_tech = req.body.use_tech || req.query.use_tech;

  if (pool) {
    updateEmplList(
      enter_id,
      empl_position,
      empl_money,
      empl_context,
      use_tech,
      function (err, updateEmplList) {
        res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>업데이트성공</h1>");
        res.write("<div><a href='/listuser.html'>리스트로 돌아가기</a></div>");
      }
    );
  }
};

var deleteList2 = function (res, req) {
  var enter_id = req.query.enter_id;
  deleteList(enter_id, function () {
    console.log("deleteList");
    res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
    res.write("<h1>삭제성공</h1>");
    res.write("<div><p>삭제성공<p></div>");
    res.write("<div><a href='/listuser.html'>리스트로 돌아가기</a></div>");
  });
};

module.exports.init = init;
module.exports.login = login;
module.exports.authList = authList;
module.exports.listUser = listUser;
module.exports.deleteList = deleteList;
module.exports.addList = addList;
module.exports.listuser = listuser;
module.exports.updateList = updateList;
module.exports.updateEmplList2 = updateEmplList2;
module.exports.deleteList2 = deleteList2;
