const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  database: "badminton",
  user: "root",
  password: "",
});

db.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
});

// -------------------------------------------------------------------  Member

app.get("/members", function (req, res) {
  db.query("SELECT * FROM tbl_member", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.post("/members", function (req, res) {
  const member_name = req.body.txtMember;

  db.query(
    "INSERT INTO tbl_member(member_name) VALUES(?)",
    [member_name],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send({ msg: "Member added successfully" });
      }
    }
  );
});

app.delete("/members/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM tbl_member WHERE recordId =?", [id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send({ msg: "Member deleted successfully" });
    }
  });
});

app.put("/members", (req, res) => {
  const recordId = req.body.txtRecordId;
  const member_name = req.body.txtMember;

  db.query(
    "UPDATE tbl_member SET member_name =? WHERE recordId =?",
    [member_name, recordId],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send({ msg: "Member updated successfully" });
      }
    }
  );
});

// -------------------------------------------------------------------  Account

app.get("/accounts", (req, res) => {
  var sql =
    "\
  SELECT tbl_account.recordId,tbl_account.member,tbl_member.member_name,tbl_account.transfer_date,tbl_account.amount\
  FROM tbl_account left join tbl_member on tbl_account.member = tbl_member.recordId\
  ORDER By tbl_account.transfer_date DESC";

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.post("/accounts", (req, res) => {
  var member = req.body.member;
  var date = req.body.date;
  var amt = req.body.amt;

  console.log(member, date, amt);

  db.query(
    "INSERT INTO tbl_account(member, transfer_date, amount) VALUES (?,?,?)",
    [member, date, amt],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send({ msg: "Account added successfully" });
      }
    }
  );
});

app.delete("/accounts/:id", (req, res) => {
  var id = req.params.id;
  db.query(
    "DELETE FROM tbl_account WHERE recordId = ?",
    [id],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send({ msg: "Account deleted successfully" });
      }
    }
  );
});

app.put("/accounts", (req, res) => {
  var id = req.body.recordId;
  var member = req.body.member;
  var date = req.body.date;
  var amt = req.body.amt;

  db.query(
    "UPDATE tbl_account SET member = ?, transfer_date = ?, amount = ? WHERE recordId =?",
    [member, date, amt, id],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send({ msg: "Account updated successfully" });
      }
    }
  );
});

app.get("/stockBall", (req, res) => {
  db.query(
    "SELECT SUM(ball) - (select SUM(countBall) from tbl_badminton) AS StockBall FROM tbl_ball",
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result[0]);
      }
    }
  );
});

app.get("/badmintonDate", (req, res) => {
  db.query(
    "select badmintonDate from tbl_badminton order by badmintonDate desc",
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.get("/accountsMenber", (req, res) => {
  var sql =
    "SELECT tbl_member.recordId,tbl_member.member_name,tbl_badminton_member.totalAmt AS amount,\
  (select amount from tbl_account where member = tbl_member.recordId and transfer_date >= (select badmintonDate from tbl_badminton order by badmintonDate desc LIMIT 1)) AS transfer\
  FROM tbl_badminton\
  LEFT JOIN	tbl_badminton_member	ON 	tbl_badminton.recordId = tbl_badminton_member.headerRecordId\
  INNER JOIN	tbl_member	ON tbl_badminton_member.member = tbl_member.recordId\
  WHERE (tbl_badminton.recordId = (SELECT recordId FROM tbl_badminton ORDER BY recordId DESC LIMIT 1))\
  ORDER BY	tbl_badminton_member.member ASC";

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.post("/badminton", (req, res) => {
  const badmintonDate = req.body.badmintonDate;
  const countBall = req.body.countBall;
  const countMembers = req.body.countMembers;
  const sumNetPerson = req.body.sumNetPerson;
  const sumNetPersonAdj = req.body.sumNetPersonAdj;
  const keepBall = req.body.keepBall;
  const amtBall = req.body.amtBall;
  const amtCourt = req.body.amtCourt;
  const sumNet = req.body.sumNet;
  const sumAmtBall = req.body.sumAmtBall;

  const checkedState = req.body.checkedState;
  const balanceAmt = req.body.balanceAmt;
  const adjustAmt = req.body.adjustAmt;
  const transAmt = req.body.transAmt;
  const totalAmt = req.body.totalAmt;

  var recordNbr = "";

  db.beginTransaction((err) => {
    if (err) {
      return res
        .status(500)
        .send({ msg: "Error starting transaction", error: err });
    }

    // Step 1: Get the latest record ID
    db.query(
      "SELECT recordId FROM tbl_badminton ORDER BY recordId DESC LIMIT 1",
      (err, result) => {
        if (err) {
          db.rollback(() => {
            return res
              .status(500)
              .send({ msg: "Error fetching latest recordId", error: err });
          });
        }

        if (!result[0]) {
          recordNbr = 1;
        } else {
          recordNbr = result[0].recordId + 1;
        }

        // Step 2: Insert data into `tbl_badminton`
        db.query(
          "INSERT INTO tbl_badminton(recordId, badmintonDate, countBall, countMember, sumNetPerson, sumNetPersonAdjust, curAmtBall, curAmtCourt, keepBall, sumNetAmt, sumNetAmtTotal) \
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            recordNbr,
            badmintonDate,
            countBall,
            countMembers,
            sumNetPerson,
            sumNetPersonAdj,
            amtBall,
            amtCourt,
            keepBall,
            sumAmtBall,
            sumNet,
          ],
          (err, result) => {
            if (err) {
              // If there is an error, rollback the transaction
              db.rollback(() => {
                return res.status(500).send({
                  msg: "Error inserting into tbl_badminton",
                  error: err,
                });
              });
            }

            // Step 3: Insert data into `tbl_badminton_member`
            Object.entries(checkedState).forEach(
              ([key, value], index, array) => {
                let aa = value == true ? sumNetPersonAdj : 0;
                let bb = keepBall == key ? sumAmtBall : 0;

                db.query(
                  "INSERT INTO tbl_badminton_member(headerRecordId,memberSta,member,balanceAmt,courtAmt,ballAmt,adjustAmt,transferAmt,totalAmt) VALUES(?,?,?,?,?,?,?,?,?)",
                  [
                    recordNbr,
                    value,
                    key,
                    balanceAmt[key],
                    aa,
                    bb,
                    adjustAmt[key],
                    transAmt[key],
                    totalAmt[key],
                  ],
                  (err, result) => {
                    if (err) {
                      // If an error occurs, rollback the transaction
                      db.rollback(() => {
                        return res.status(500).send({
                          msg: "Error inserting into tbl_badminton_member",
                          error: err,
                        });
                      });
                    }

                    // If we have completed all inserts, commit the transaction
                    if (index === array.length - 1) {
                      db.commit((err) => {
                        if (err) {
                          db.rollback(() => {
                            return res.status(500).send({
                              msg: "Error committing transaction",
                              error: err,
                            });
                          });
                        }

                        res.send({ msg: "Transaction completed successfully" });
                      });
                    }
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});

app.get("/report/:date", (req, res) => {
  const date = req.params.date;
  var main_result = {};

  // First query
  var sql1 = `SELECT * FROM tbl_badminton WHERE badmintonDate = '${date}'`;
  db.query(sql1, (err, result_1) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send("An error occurred while fetching the first result");
    } else {
      main_result["header"] = result_1;

      // Second query, inside the first query callback
      var sql2 = `SELECT * FROM tbl_badminton_member
        INNER JOIN tbl_badminton ON tbl_badminton_member.headerRecordId = tbl_badminton.recordId
        INNER JOIN tbl_member ON tbl_badminton_member.member = tbl_member.recordId
        WHERE tbl_badminton.badmintonDate = '${date}'`;

      db.query(sql2, (err, result_2) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .send("An error occurred while fetching the second result");
        } else {
          main_result["detail"] = result_2;

          // Send the combined result after both queries complete
          res.send(main_result);
        }
      });
    }
  });
});


app.listen(3001, () => {
  console.log("Server listening on port 3001");
});
