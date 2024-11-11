import { Router } from "express";
import {
  login,
  refreshToken,
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  logout,
  editEmployee,
  updateUserAvatar,
  deleteEmployee
} from "./controller.js";
import { upload, authenticateToken } from "./middleware.js";

const router = Router();

router.route("/login").post(login);
router.route("/refresh-token").post(refreshToken)
router.route("/logout").post(logout)


// protected routes
router.use(authenticateToken);
router
  .route("/createEmployee")
  .post(upload.fields([{ name: "f_Image", maxCount: 1 }]), createEmployee);
router.route("/getAllEmployee").get(getAllEmployees);
router.route("/getEmployeeById/:id").get(getEmployeeById);
router.route("/editEmployee/:Employee_Id").put(upload.single("f_Image"), editEmployee);
// router.route("/Updateavatar/:id").patch( upload.single("f_Image"), updateUserAvatar)
router.route("/deleteEmployee/:Employee_Id").delete(deleteEmployee);  

export default router;
