import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MyAlert = withReactContent(Swal);

function Member() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ txtRecordId: "", txtMember: "" });

  useEffect(() => {
    getMember();
  }, []);

  const getMember = async () => {
    await axios.get("http://localhost:3001/members").then((response) => {
      setMembers(response.data);
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    if (!form.txtRecordId) {
      await axios.post("http://localhost:3001/members", form).then((res) => {});
    } else {
      await axios.put("http://localhost:3001/members", form).then((res) => {});
    }
    setForm({ txtRecordId: "", txtMember: "" });
    getMember();
  };

  const handleDelete = async (id) => {
    const result = await MyAlert.fire({
      title: "ลบสมาชิก",
      text: "คุณต้องการลบสมชิกใช่ไหม ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่",
      cancelButtonText: "ไม่ใช่",
    });

    if (result.isConfirmed) {
      await axios.delete(`http://localhost:3001/members/${id}`).then((res) => {
        console.log(res.status);
        if (res.status == 200) {
          MyAlert.fire({
            title: "ลบสำเร็จ",
            text: "ลบสมาชิกกสำเร็จ",
            icon: "success",
            willClose: () => {
              getMember();
            },
          });
        } else {
          MyAlert.fire({
            title: "ลบไม่สำเร็จ",
            text: "ไม่สามารถลบสมาชิกได้",
            icon: "error",
          });
        }
      });
    }
  };

  const handleEdit = async (id, name) => {
    setForm({ txtRecordId: id, txtMember: name });
  };

  return (
    <>
      <div className="mx-32">
        <div className="flex gap-4">
          <div className="text-xl font-bold">รายชื่อสมาชิก</div>
        </div>
        <div className="divider"></div>

        <div className="flex flex-row gap-2 items-center">
          <div>
            <label htmlFor="txtMember">ชื่อสมาชิก</label>
          </div>
          <div>
            <input
              type="hidden"
              className="input input-bordered w-full max-w-xs input-sm"
              id="txtMemberId"
              name="txtMemberId"
              onChange={(e) => handleChange(e)}
              value={form.txtRecordId}
            />
            <input
              type="text"
              className="input input-bordered w-full max-w-xs input-sm"
              id="txtMember"
              name="txtMember"
              onChange={(e) => handleChange(e)}
              value={form.txtMember}
            />
          </div>
          <div>
            <button
              className="btn btn-info btn-sm"
              onClick={() => handleSubmit()}
            >
              เพิ่ม
            </button>
          </div>
        </div>

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg pt-4">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3 text-center w-[50px]">
                  ลำดับ
                </th>
                <th scope="col" className="px-6 py-3">
                  ชื่อสมาชิก
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
              {members.map((item, index) => (
                <tr
                  key={index}
                  className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                >
                  <td className="px-2 py-1 text-center">{index + 1}</td>
                  <td className="px-2 py-1">{item.member_name}</td>
                  <td className="px-2 py-1">
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() =>
                        handleEdit(item.recordId, item.member_name)
                      }
                    >
                      แก้ไข
                    </button>
                  </td>
                  <td className="px-2 py-1">
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => handleDelete(item.recordId)}
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

export default Member;
