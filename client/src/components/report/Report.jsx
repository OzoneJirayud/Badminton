import React, { useEffect, useState } from "react";
import axios from "axios";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";

import moment from "moment";

function Report() {
  const [date, setDate] = useState("");
  const [reportDetail, setReportDetail] = useState([]);
  const [reportHeader, setReportHeader] = useState([]);
  const [stockBall, setStockBall] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getBadmintonDate();
  }, []);

  const fetchReportDetail = async (date) => {
    await axios.get("http://localhost:3001/report/" + date).then((resp) => {
      if (resp.data.header[0]) {
        setReportHeader(resp.data.header[0]);
        setReportDetail(resp.data.detail);
        getStockBall();
      } else {
        setReportHeader([]);
        setReportDetail([]);
        getStockBall("");
      }
    });
  };

  const getStockBall = async () => {
    await axios.get("http://localhost:3001/stockBall").then((resp) => {
      setStockBall(resp.data);
    });
  };

  const getBadmintonDate = async () => {};

  const handleChamgeDate = async (date) => {
    setLoading(true);
    let select_date = moment(date).format("YYYY-MM-DD");
    fetchReportDetail(select_date);

    setLoading(false);
  };

  const handleDayCreate = async (dObj, dStr, fp, dayElem) => {
    const dayNumber = parseInt(dayElem.innerText);
    const currentYear = fp.currentYear;
    const currentMonth = fp.currentMonth + 1;

    await axios.get("http://localhost:3001/badmintonDate").then((resp) => {
      resp.data.forEach((value) => {
        let badDay = moment(value.badmintonDate).format("D");
        let badMonth = moment(value.badmintonDate).format("M");
        let badYear = moment(value.badmintonDate).format("YYYY");

        if (
          dayNumber === parseInt(badDay) &&
          currentMonth === parseInt(badMonth) &&
          currentYear === parseInt(badYear)
        ) {
          dayElem.classList.add(
            "bg-sky-300",
            "text-white",
            "rounded-full",
            "font-bold"
          );
        }
      });
    });
  };

  return (
    <>
      <div className="mx-24 text-md">
        <div className="flex gap-4">
          <div className="text-xl w-32 font-bold">รายงานวันที่</div>
          <div className="w-56">
            <Flatpickr
              className="w-full px-2 py-1 border rounded-lg border-gray-300"
              value={date}
              options={{
                onDayCreate: handleDayCreate,
                dateFormat: "d-M-Y",
              }}
              onChange={(e) => handleChamgeDate(e[0])}
            />
          </div>
        </div>
        <div className="divider"></div>
        <div className="flex items-center">
          <div className="w-1/2 ps-10">
            {loading && (
              <p className="text-md text-success inline-flex animate-ping duration-1000">
                Loading...
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-7">
            <div className="flex p-2 rounded-lg shadow-md bg-sky-800 text-white font-bold">
              <div className="w-32 text-center">ชื่อ</div>
              <div className="w-32 text-center">ยอดยกมา</div>
              <div className="w-32 text-center">ค่าคอร์ท</div>
              <div className="w-32 text-center">เพิ่มเติม</div>
              <div className="w-32 text-center">ค่าลูก</div>
              <div className="w-32 text-center">โอน</div>
              <div className="w-32 text-center">สุทธิ</div>
            </div>
            {reportDetail.map((item, index) => (
              <div
                key={index}
                className={`flex p-2 mt-2 rounded-lg shadow-md ${
                  item.memberSta.data == 1 ? "bg-green-200" : "bg-red-200"
                }`}
              >
                <div className="w-32  text-center">{item.member_name}</div>
                <div className="w-32 text-center">{item.balanceAmt}</div>
                <div className="w-32 text-center text-red-600">
                  {item.courtAmt > 0 && "-" + item.courtAmt}
                </div>
                <div className="w-32 text-center text-red-600">
                  {item.adjustAmt > 0 && "-" + item.adjustAmt}
                </div>
                <div className="w-32 text-center text-green-600">
                  {item.ballAmt > 0 && item.ballAmt}
                </div>
                <div className="w-32 text-center text-green-600">
                  {item.transferAmt > 0 && item.transferAmt}
                </div>
                <div
                  className={`w-32 text-center font-bold text-md ${
                    item.totalAmt > 0 ? "text-sky-600" : "text-red-600"
                  }`}
                >
                  {item.totalAmt}
                </div>
              </div>
            ))}
          </div>
          <div className="col-span-5 text-md pt-3 px-2 bg-sky-100 rounded-md shadow-md">
            <div className="grid grid-cols-4 gap-2">
              <div className="text-lg">สรุปยอดวันที่</div>
              <div className="col-span-2 text-lg font-bold text-gray-700 text-center">
                {reportHeader.badmintonDate &&
                  moment(reportHeader.badmintonDate).format("DD-MMM-YYYY")}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-4 justify-center items-center">
              <div className="">จำนวนคนตีแบด</div>
              <div className="text-lg font-bold text-gray-700 border-b-2 text-center">
                {reportHeader.countMember}
              </div>
              <div className="">ค่าคอร์ท</div>
              <div className="text-lg font-bold text-gray-700 border-b-2 text-center">
                {reportHeader.curAmtCourt}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-4 justify-center items-center">
              <div className="">จำนวนลูกแบด</div>
              <div className="flex gap-4">
                <div className="w-1/2 text-lg font-bold text-gray-700 border-b-2 text-center">
                  {reportHeader.countBall}
                </div>
                <div className="w-1/2 text-lg font-bold text-gray-700 border-b-2 text-center">
                  {reportHeader.curAmtBall}
                </div>
              </div>
              <div className="">ค่าลูก</div>
              <div className="text-lg font-bold text-gray-700 border-b-2 text-center">
                {reportHeader.sumNetAmt}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-4 justify-center items-center">
              <div className="row-span-2">ลูกคงเหลือ</div>
              <div
                className={`text-2xl font-bold border-b-2 text-center ${
                  stockBall.StockBall >= 4
                    ? "text-green-600"
                    : "text-red-600 ping"
                } `}
              >
                {stockBall.StockBall}
              </div>
              <div className="">รวมสุทธิ</div>
              <div className="text-lg font-bold text-gray-700 border-b-2 text-center">
                {reportHeader.sumNetAmtTotal}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-4 justify-center items-center">
              <div className="col-start-3">รวมสุทธิ/คน</div>
              <div className="text-2xl font-bold text-red-700 border-b-2 text-center">
                {reportHeader.sumNetPersonAdjust}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Report;
