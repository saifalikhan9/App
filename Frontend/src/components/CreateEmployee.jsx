import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { createEmployee } from "../utils/api.js";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

export default function CreateEmployee() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    f_Name: "",
    f_Email: "",
    f_Mobile: 0,
    f_Designation: "",
    f_Gender: "",
    f_Course: "",
    f_Image: null,
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "f_Mobile" ? parseInt(value, 10) || "" : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      f_Image: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await createEmployee(formData);
      toast.success("Employee created successfully!");
      navigate("/dashboard/employees");
    } catch (err) {
      setError(err.message);
      toast.error(err.message)
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Create New Employee
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="f_Name">Name</Label>
              <Input
                id="f_Name"
                name="f_Name"
                value={formData.f_Name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="f_Email">Email</Label>
              <Input
                id="f_Email"
                name="f_Email"
                type="email"
                value={formData.f_Email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="f_Mobile">Mobile</Label>
              <Input
                id="f_Mobile"
                name="f_Mobile"
                value={formData.f_Mobile===0 ? "" : formData.f_Mobile}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="f_Designation">Designation</Label>
              <Select
                name="f_Designation"
                onValueChange={(value) =>
                  handleSelectChange("f_Designation", value)
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="f_Gender">Gender</Label>
              <RadioGroup onValueChange={(value) => handleSelectChange("f_Gender", value)} defaultValue="Male">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Male" id="r1" />
                  <Label htmlFor="r1">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Female" id="r2" />
                  <Label htmlFor="r2">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Other" id="r3" />
                  <Label htmlFor="r3">Other</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="f_Course">Course</Label>
              <Select
                name="f_Course"
                onValueChange={(value) => handleSelectChange("f_Course", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MCA">MCA</SelectItem>
                  <SelectItem value="BCA">BCA</SelectItem>
                  <SelectItem value="BSC">BSC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="f_Image">Image</Label>
              <Input
                id="f_Image"
                name="f_Image"
                type="file"
                onChange={handleFileChange}
                accept="image/jpeg, image/png"
                required
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <Button type="submit" className="w-full bg-[#1f2937] hover:bg-[#151c25]">
              Create Employee
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
