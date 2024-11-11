import React, { useState, useEffect } from "react";
import { Link, useNavigate  } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { fetchEmployees, deleteEmployee, createEmployee } from "../utils/api.js";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log(employees);
  

  const navigate = useNavigate();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await fetchEmployees();
      console.log(data, "from load data");
      
      setEmployees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {

    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await deleteEmployee(id);
        setEmployees(employees.filter((emp) => emp._id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };
  const handleEdit = (id) => {
    navigate(`/dashboard/editEmployee/${id}`);
  };

  if (loading) return <div>Loading...</div>;
  if (employees.length === 0)
    return (
      <div className="flex  relative items-center justify-center" style={{ minHeight: 'calc(100vh - 104px)' }}>
        <h1 className="text-center text-3xl">Please add an Employee</h1>
        <Link to="/dashboard/createEmployee">
        <Button variant="outline"  className="bg-green-400 absolute top-5 right-5 hover:bg-green-800" onClick={createEmployee} >Create Employee</Button>
      
            </Link>
        </div>
    );

  return (
    <div className="container mx-2 p-5">
     <Link to="/dashboard/createEmployee">
        <Button variant="outline"  className="bg-green-400 absolute  right-5 hover:bg-green-800" onClick={createEmployee} >Create Employee</Button>
      
            </Link>
      
      <h1 className="mb-4 text-2xl font-bold">Employee List</h1>

      <Table >
        <TableHeader >
          <TableRow>
            <TableHead>Avatar</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Mobile Number</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee._id}>
              <TableCell>
                <img
                  src={employee.f_Image}
                  alt={employee.f_Name}
                  className="h-10 w-10 rounded-full"
                />
              </TableCell>
              <TableCell>{employee.f_Name}</TableCell>
              <TableCell>{employee.f_Email}</TableCell>
              <TableCell>{employee.f_Mobile}</TableCell>
              <TableCell>{employee.f_Designation}</TableCell>
              <TableCell>{employee.f_Gender}</TableCell>
              <TableCell>{employee.f_Course}</TableCell>
              <TableCell>
              <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEdit(employee._id)}>
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(employee._id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
