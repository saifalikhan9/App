import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { updateEmployee, fetchEmployees } from "../utils/api";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";


const INITIAL_FORM_STATE = {
  f_Name: "",
  f_Email: "",
  f_Mobile: null,
  f_Designation: "",
  f_Gender: "",
  f_Course: "",
  f_Image: null,
};

const DESIGNATION_OPTIONS = [
  { value: "HR", label: "HR" },
  { value: "Manager", label: "Manager" },
  { value: "Sales", label: "Sales" },
];

const COURSE_OPTIONS = [
  { value: "MCA", label: "MCA" },
  { value: "BCA", label: "BCA" },
  { value: "BSC", label: "BSC" },
];

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  // Memoized form validation
  const isFormValid = useMemo(() => {
    return (
      formData.f_Name &&
      formData.f_Email &&
      formData.f_Mobile &&
      formData.f_Designation &&
      formData.f_Gender &&
      formData.f_Course
    );
  }, [formData]);

  // Memoized check for changes
  const hasChanges = useMemo(() => {
    if (!originalData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  }, [formData, originalData]);

  useEffect(() => {
    let isSubscribed = true;
    
    const loadEmployee = async () => {
      try {
        const employees = await fetchEmployees();
        if (!isSubscribed) return;
        
        const employee = employees.find((emp) => emp._id === id);
        if (!employee) {
          setError("Employee not found");
          return;
        }

        const initialData = {
          f_Name: employee.f_Name,
          f_Email: employee.f_Email,
          f_Mobile: Number(employee.f_Mobile),
          f_Designation: employee.f_Designation,
          f_Gender: employee.f_Gender,
          f_Course: employee.f_Course,
        };

        setFormData(initialData);
        setOriginalData(initialData);
      } catch (err) {
        if (isSubscribed) {
          setError("Failed to load employee data");
          toast.error("Failed to load employee data");
        }
      }
    };

    loadEmployee();
    return () => {
      isSubscribed = false;
    };
  }, [id]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "f_Mobile" ? (value === "" ? null : Number(value)) : value,
    }));
  }, []);

  const handleSelectChange = useCallback((name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setFormData(prev => ({
        ...prev,
        f_Image: file,
      }));
    } else {
      toast.error("Please select a valid image file (JPG or PNG)");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || isLoading || !hasChanges) {
      toast.error("Please check form data");
      return;
    }

    setIsLoading(true);
    const formDataToSend = new FormData();

    try {
      // Batch append operations
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          if (key === 'f_Mobile') {
            formDataToSend.append(key, Number(value).toString());
          } else {
            formDataToSend.append(key, value);
          }
        }
      });

      await updateEmployee(id, formDataToSend);
      toast.success("Employee updated successfully");
      navigate("/dashboard/employees");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Render optimization using memo for static content
  const SelectOptions = useMemo(() => ({
    Designation: DESIGNATION_OPTIONS.map(option => (
      <SelectItem key={option.value} value={option.value}>
        {option.label}
      </SelectItem>
    )),
    Course: COURSE_OPTIONS.map(option => (
      <SelectItem key={option.value} value={option.value}>
        {option.label}
      </SelectItem>
    ))
  }), []);

  const handleCancel = () => {
    navigate("/dashboard/employees");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Employee</CardTitle>
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
                disabled={isLoading}
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
                type="number"
                id="f_Mobile"
                name="f_Mobile"
                value={formData.f_Mobile || ""}
                onChange={handleChange}
                required
                disabled={isLoading}
                min="0"
                step="1"
                pattern="\d*"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="f_Designation">Designation</Label>
              <Select
                name="f_Designation"
                onValueChange={(value) => handleSelectChange("f_Designation", value)}
                defaultValue={formData.f_Designation}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.f_Designation || "Select"} />
                </SelectTrigger>
                <SelectContent>
                  {SelectOptions.Designation}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="f_Gender">Gender</Label>
              <RadioGroup
                onValueChange={(value) => handleSelectChange("f_Gender", value)}
                defaultValue={formData.f_Gender || "Male"}
              >
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
                defaultValue={formData.f_Course}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={formData.f_Course || "Select Course"}
                  />
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
              />
            </div>
            <div className="relative">
              <Button 
                type="submit" 
                className="w-1/2"
                disabled={isLoading || !isFormValid || !hasChanges}
              >
                {isLoading ? "Updating..." : "Update Employee"}
              </Button>
              <Button
                onClick={() => navigate("/dashboard/employees")}
                className="absolute mx-5 p-3 w-1/4 right-1 text-black bg-red-500 hover:bg-red-700"
                disabled={isLoading}
                type="button"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
