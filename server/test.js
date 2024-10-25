db.rollback(() => {
  return res.status(500).send({
    msg: "Error fetching latest recordId",
    error: err,
  });
});

db.rollback(() => {
  return res.status(500).send({
    msg: "Error inserting into tbl_badminton",
    error: err,
  });
});

db.rollback(() => {
  return res.status(500).send({
    msg: "Error inserting into tbl_badminton_member",
    error: err,
  });
});
