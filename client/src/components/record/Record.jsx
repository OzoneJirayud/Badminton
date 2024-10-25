import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";

import moment from "moment";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MyAlert = withReactContent(Swal);


function Record() {
  const navigate = useNavigate();

  const [listMembers, setListMembers] = useState([]);
  const [checkedState, setCheckedState] = useState({});

  const [balanceAmt, setBalanceAmt] = useState({});
  const [adjustAmt, setAdjustAmt] = useState({});
  const [transAmt, setTransAmt] = useState({});
  const [totalAmt, setTotalAmt] = useState({});

  /////////////

  const [badmintonDate, setBadmintonDate] = useState("");
  const [countMembers, setCountMembers] = useState("");
  const [court, setCourt] = useState(120);

  const [countBall, setCountBall] = useState(0);
  const [amtBall, setAmtBall] = useState(65);
  const [sumAmtBall, setSumAmtBall] = useState(0);

  const [sumNet, setSumNet] = useState(0);
  const [sumNetPerson, setSumNetPerson] = useState(0);
  const [sumNetPersonAdj, setSumNetPersonAdj] = useState(0);

  const [keepBall, setKeepBall] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (countBall > 0 && countMembers > 0) {
      let sumAmtBall = countBall * amtBall;
      let sumNet = court + sumAmtBall;
      let sumNetPerson = sumNet / countMembers;

      setSumAmtBall(sumAmtBall);
      setSumNet(sumNet);
      setSumNetPerson(sumNetPerson);
      setSumNetPersonAdj(roundByNum(sumNetPerson));
    } else {
      setSumAmtBall(0);
      setSumNet(0);
      setSumNetPerson(0);
      setSumNetPersonAdj(roundByNum(0));
    }
  }, [countBall, countMembers]);

  useEffect(() => {
    const initialTotalAmt = {};
    listMembers.forEach((member) => {
      if (checkedState[member.recordId] === true) {
        var calAmt = balanceAmt[member.recordId] - sumNetPersonAdj;
      } else {
        var calAmt = balanceAmt[member.recordId];
      }

      if (adjustAmt[member.recordId] > 0) {
        calAmt = calAmt - adjustAmt[member.recordId];
      }

      if (transAmt[member.recordId] > 0) {
        calAmt = calAmt + transAmt[member.recordId];
      }

      if (keepBall == member.recordId) {
        calAmt = calAmt + sumAmtBall;
      }

      initialTotalAmt[member.recordId] = calAmt;
    });

    setTotalAmt(initialTotalAmt);
  }, [sumNetPersonAdj, adjustAmt, keepBall]);

  // console.log("totalAmt", totalAmt);
  // console.log("balanceAmt", balanceAmt);

  const fetchMembers = async () => {
    await axios.get("http://localhost:3001/accountsMenber").then((resp) => {
      let response = resp.data;
      setListMembers(response);

      const initialCheckedState = {};
      const initialBalanceAmt = {};
      const initialAdjustAmt = {};
      const initialTransAmt = {};
      const initialTotalAmt = {};
      response.forEach((resp) => {
        initialCheckedState[resp.recordId] = false;
        initialBalanceAmt[resp.recordId] = resp.amount;
        initialAdjustAmt[resp.recordId] = "";
        initialTransAmt[resp.recordId] = resp.transfer || "";
        initialTotalAmt[resp.recordId] = resp.amount;
      });
      setCheckedState(initialCheckedState);
      setBalanceAmt(initialBalanceAmt);
      setAdjustAmt(initialAdjustAmt);
      setTransAmt(initialTransAmt);
      setTotalAmt(initialTotalAmt);
    });
  };

  // console.log(transAmt);

  const handleCheckboxChange = (recordId) => {
    setCheckedState({
      ...checkedState,
      [recordId]: !checkedState[recordId],
    });

    let checkedBoxes = document.querySelectorAll(
      "input[name=txtMember]:checked"
    ).length;

    setCountMembers(checkedBoxes);
  };

  const incrementCounter = () => {
    let count = countBall + 1;
    setCountBall(count);
  };

  // console.log(totalAmt);

  const decrementCounter = () => {
    if (countBall !== 0) {
      let count = countBall - 1;
      setCountBall(count);
    }
  };

  function roundByNum(x) {
    return Math.ceil(x / 5) * 5;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const postData = {
      badmintonDate: moment(new Date(badmintonDate)).format("YYYY-MM-DD"),
      countMembers: countMembers,
      countBall: countBall,
      amtBall: amtBall,
      amtCourt: court,
      sumAmtBall: sumAmtBall,
      sumNet: sumNet,
      sumNetPerson: sumNetPerson,
      sumNetPersonAdj: sumNetPersonAdj,
      keepBall: keepBall,

      checkedState: checkedState,
      balanceAmt: balanceAmt,
      adjustAmt: adjustAmt,
      transAmt: transAmt,
      totalAmt: totalAmt,
    };

    console.log(postData);

    await axios
      .post("http://localhost:3001/badminton", postData)
      .then((resp) => {
        console.log(resp);
        if (resp.status == 200) {
          MyAlert.fire({
            title: "บันทึกสำเร็จ",
            text: "บันทึกข้อมูลสำเร็จ",
            icon: "success",
            willClose: () => {
              navigate("/Report");
            },
          });
        }
      });
  };

  const handleAdjustAmt = (e, recordId) => {
    setAdjustAmt({
      ...adjustAmt,
      [recordId]: e.target.value != "" ? parseInt(e.target.value) : "",
    });
  };

  const handleTransAmt = (e, recordId) => {
    setTransAmt({
      ...transAmt,
      [recordId]: e.target.value != "" ? parseInt(e.target.value) : "",
    });
  };

  return (
    <>
      <div className="flex gap-4">
        <div className="text-xl font-bold">บันทึกข้อมูล</div>
      </div>
      <div className="divider"></div>
      <form onSubmit={handleSubmit}>
        <div className="grid sm:grid-rows-2 md:grid-cols-12 gap-8 md:px-2 p-2">
          <div className="md:col-span-7 flex flex-col gap-2 bg-gray-200 p-4 rounded-lg shadow-lg">
            <div className="grid grid-cols-8 p-2 items-center gap-2 bg-gray-500 text-white rounded-xl">
              <div className="text-center">#</div>
              <div className="text-center">ชื่อ</div>
              <div className="text-end">คงเหลือ</div>
              <div className="text-end">ค่าคอร์ท</div>
              <div className="text-end">ค่าลูก</div>
              <div className="text-end">เพิ่ม</div>
              <div className="text-end">โอน</div>
              <div className="text-end">สุทธิ</div>
            </div>
            {listMembers.map((item) => (
              <div
                key={item.recordId}
                className={`grid grid-cols-8 p-2 items-center gap-2 rounded-md ${
                  checkedState[item.recordId] ? "bg-green-200" : "bg-red-200"
                }`}
              >
                <div>
                  <div className="flex gap-2 items-center justify-center">
                    <input
                      type="checkbox"
                      checked={checkedState[item.recordId] || false}
                      onChange={() => handleCheckboxChange(item.recordId)}
                      name="txtMember"
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </div>
                </div>
                <div className="">{item.member_name}</div>
                <div className="text-end">{item.amount}</div>
                <div className="text-end text-red-500 font-medium">
                  {checkedState[item.recordId] && "-" + sumNetPersonAdj}
                </div>
                <div className="text-end text-green-700 font-medium">
                  {item.recordId == keepBall && sumAmtBall}
                </div>

                <div className="">
                  <input
                    type="text"
                    className=" p-1 w-full max-w-xs font-medium text-end bg-red-100 text-red-700 rounded-md"
                    onChange={(e) => handleAdjustAmt(e, item.recordId)}
                    value={adjustAmt[item.recordId]}
                  />
                </div>
                <div className="">
                  <input
                    type="text"
                    className="p-1 w-full max-w-xs font-medium text-end bg-green-100 text-green-700 rounded-md"
                    onChange={(e) => handleTransAmt(e, item.recordId)}
                    value={transAmt[item.recordId]}
                  />
                </div>
                <div
                  className={`text-end font-bold ${
                    totalAmt[item.recordId] <= 0
                      ? "text-red-500"
                      : "text-sky-700"
                  }`}
                >
                  {totalAmt[item.recordId]}
                </div>
              </div>
            ))}
          </div>

          <div className="md:col-span-5 flex flex-col gap-2 bg-gray-200 p-4 rounded-lg shadow-lg">
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-end">วันที่ตีแบต</div>
              <div>
                <Flatpickr
                  className="w-full px-2 py-1 border rounded-lg border-gray-300"
                  value={badmintonDate}
                  options={{
                    dateFormat: "d-M-Y",
                  }}
                  onChange={(e) => setBadmintonDate(e[0])}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-end">
                <label>จำนวนคนตีแบด</label>
              </div>
              <div className="">
                <input
                  type="text"
                  className="input input-bordered w-full max-w-xs input-sm"
                  value={countMembers}
                  onChange={setCountMembers}
                />
              </div>
              <div className="text-end">
                <label>ค่าคอร์ท</label>
              </div>
              <div className="">
                <input
                  type="text"
                  className="input input-bordered w-full max-w-xs input-sm"
                  value={court}
                  onChange={setCourt}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-end">
                <label>จำนวนลูกแบด</label>
              </div>
              <div className="flex gap-1">
                <div className="">
                  <button
                    type="button"
                    className="btn btn-success btn-sm w-2"
                    onClick={incrementCounter}
                  >
                    +
                  </button>
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full max-w-xs input-sm"
                  value={countBall}
                  onChange={(e) => setCountBall(e)}
                />
                <div>
                  <button
                    type="button"
                    className="btn btn-error btn-sm w-2"
                    onClick={decrementCounter}
                  >
                    -
                  </button>
                </div>
              </div>
              <div className="">
                <input
                  type="text"
                  className="input input-bordered w-full max-w-xs input-sm"
                  value={amtBall}
                  onChange={(e) => setAmtBall(e.target.value)}
                />
              </div>
              <div className="">
                <input
                  type="text"
                  className="input input-bordered w-full max-w-xs input-sm"
                  onChange={setSumAmtBall}
                  value={sumAmtBall}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-end">จ่ายค่าลูก</div>
              <div>
                <select
                  onChange={(e) => setKeepBall(e.target.value)}
                  className="select select-bordered select-sm w-full max-w-xs"
                >
                  <option value=""></option>
                  {listMembers.map((item) => (
                    <option key={item.recordId} value={item.recordId}>
                      {item.member_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-end">
                <label className="">จำนวนรวม</label>
              </div>
              <div>
                <input
                  type="text"
                  className="input input-bordered w-full max-w-xs input-sm"
                  value={sumNet}
                  onChange={setSumNet}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 content-start">
              <div></div>
              <div></div>
              <div className="text-end ">
                <label className="">จำนวนต่อคน</label>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input input-bordered max-w-xs input-sm w-1/2"
                  value={sumNetPerson}
                  onChange={setSumNetPerson}
                />
                <div className="w-1/2 bg-white rounded-lg text-center text-3xl p-2 text-green-600 font-bold">
                  {sumNetPersonAdj}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 content-start">
              <button
                type="submit"
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
Record;

export default Record;
