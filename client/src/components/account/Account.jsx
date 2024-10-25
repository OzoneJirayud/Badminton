import axios from "axios";
import React, { useEffect, useState } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MyAlert = withReactContent(Swal);

import moment from "moment";

function Account() {
  const [listmembers, setListMembers] = useState([]);
  const [listAccounts, setListAccounts] = useState([]);

  const [recordId, setRecordId] = useState("");
  const [date, setDate] = useState("");
  const [member, setMember] = useState("");
  const [amt, setAmt] = useState("");

  useEffect(() => {
    fetchMembers();
    fetchAccount();
  }, []);

  const fetchMembers = async () => {
    await axios.get("http://localhost:3001/members").then((resp) => {
      setListMembers(resp.data);
    });
  };

  const fetchAccount = async () => {
    await axios.get("http://localhost:3001/accounts").then((resp) => {
      setListAccounts(resp.data);
    });
  };

  const handleSubmit = async () => {
    var data = {
      recordId: recordId,
      date: moment(new Date(date)).format("YYYY-MM-DD"),
      member: member,
      amt: amt,
    };

    if (!recordId) {
      await axios.post("http://localhost:3001/accounts", data).then((resp) => {
        fetchAccount();
        clearData();
      });
    } else {
      await axios.put("http://localhost:3001/accounts", data).then((resp) => {
        fetchAccount();
        clearData();
      });
    }
  };

  const handledDelete = async (id) => {
    const result = await MyAlert.fire({
      title: "ลบบัญชี",
      text: "คุณต้องการลบบัญชีใช่ไหม ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่",
      cancelButtonText: "ไม่ใช่",
    });

    if (result.isConfirmed) {
      await axios.delete("http://localhost:3001/accounts/" + id).then(() => {
        fetchAccount();
        clearData();
      });
    }
  };

  const handleEdit = async (id, member, amt, date) => {
    setRecordId(id);
    setDate(moment(date).format("DD-MMM-YYYY"));
    setMember(member);
    setAmt(amt);
  };

  const handleAmt = (amt) => {
    if (amt === "" || /^\d+$/.test(amt)) {
      setAmt(amt);
    }
  };

  const clearData = () => {
    setDate("");
    setMember("");
    setAmt("");
  };

  return (
    <>
      <div className="mx-32">
        <div className="flex gap-4">
          <div className="text-xl font-bold">บัญชีรับ</div>
        </div>
        <div className="divider"></div>

        <div className="flex flex-row gap-2 items-center">
          <div>
            <label htmlFor="txtMember">ชื่อสมาชิก</label>
          </div>
          <div className="w-32">
            <input
              type="hidden"
              className="input input-bordered w-full max-w-xs input-sm"
              id="txtAccountId"
              name="txtAccountId"
              value={recordId}
            />
            <select
              className="select select-bordered select-sm w-full max-w-xs"
              name="member"
              onChange={(e) => setMember(e.target.value)}
              value={member}
            >
              <option></option>
              {listmembers.map((item, index) => (
                <option key={index} value={item.recordId}>
                  {item.member_name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-32">
            <input
              type="text"
              className="input input-bordered w-full max-w-xs input-sm"
              id="txtTransferAmt"
              name="txtTransferAmt"
              onChange={(e) => handleAmt(e.target.value)}
              value={amt}
            />
          </div>
          <div className="w-32">
            <Flatpickr
              className="w-full px-2 py-1 border rounded-lg border-gray-300"
              value={date}
              options={{
                dateFormat: "d-M-Y",
              }}
              onChange={(e) => setDate(e[0])}
            />
          </div>
          <div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleSubmit()}
            >
              บันทึก
            </button>
          </div>
        </div>

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg pt-4">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-2 py-1 text-center w-[50px]">
                  ลำดับ
                </th>
                <th scope="col" className="px-2 py-1">
                  ชื่อ
                </th>
                <th scope="col" className="px-6 py-3">
                  จำนวน
                </th>
                <th scope="col" className="px-6 py-3">
                  วันที่โอน
                </th>
                <th scope="col" className="px-6 py-3 w-[50px]">
                  แก้ไข
                </th>
                <th scope="col" className="px-6 py-3 w-[50px]">
                  ลบ
                </th>
              </tr>
            </thead>
            <tbody>
              {listAccounts.map((item, index) => (
                <tr
                  key={index}
                  className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                >
                  <td className="px-2 py-1 text-center">{index + 1}</td>
                  <td className="px-2 py-1">{item.member_name}</td>
                  <td className="px-2 py-1">{item.amount}</td>
                  <td className="px-2 py-1">
                    {moment(item.transfer_date).format("DD-MMM-YYYY")}
                  </td>
                  <td className="px-2 py-1">
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() =>
                        handleEdit(
                          item.recordId,
                          item.member,
                          item.amount,
                          item.transfer_date
                        )
                      }
                    >
                      แก้ไข
                    </button>
                  </td>
                  <td className="px-2 py-1">
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => handledDelete(item.recordId)}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Account;
