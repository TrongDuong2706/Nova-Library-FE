import * as yup from 'yup'
//const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export const schema = yup.object({
  username: yup
    .string()
    .required('Tài khoản không được để trống')
    .min(5, 'Độ dài từ 5-160 ký tự')
    .max(160, 'Độ dài từ 5-160 ký tự'),
  // email: yup
  //   .string()
  //   .required('Email không được để trống')
  //   .matches(emailRegex, 'Email không đúng định dạng') // Dùng regex kiểm tra
  //   .min(5, 'Độ dài từ 5-160 ký tự')
  //   .max(160, 'Độ dài từ 5-160 ký tự'),
  password: yup
    .string()
    .required('Mật khẩu không được để trống')
    .min(6, 'Độ dài từ 6 - 160 ký tự')
    .max(160, 'Độ dài từ 6 đến 160 ký tự'),
  confirm_password: yup
    .string()
    .required('Vui lòng nhập lại mật khẩu')
    .min(6, 'Độ dài từ 6 - 160 ký tự')
    .max(160, 'Độ dài từ 6 đến 160 ký tự')
    .oneOf([yup.ref('password')], 'Password không khớp'),
  lastName: yup
    .string()
    .required('Vui lòng nhập lại tên')
    .min(1, 'Độ dài từ 6 - 160 ký tự')
    .max(160, 'Độ dài từ 6 đến 160 ký tự'),
  firstName: yup
    .string()
    .required('Vui lòng nhập lại họ')
    .min(1, 'Độ dài từ 6 - 160 ký tự')
    .max(160, 'Độ dài từ 6 đến 160 ký tự')
})

export const schemaLogin = yup.object({
  username: yup.string().required('Tài khoản không được để trống'),
  password: yup.string().required('Mật khẩu không được để trống')
})

export const schemaPassword = yup.object({
  password: yup.string().required('Mật khẩu không được để trống'),
  newPassword: yup.string().required('Vui lòng xác nhận lại mật khẩu'),
  confirmPassword: yup
    .string()
    .required('Vui lòng xác nhận lại mật khẩu')
    .oneOf([yup.ref('newPassword')], 'Mật khẩu nhập lại không khớp')
})
export type PasswordFormData = yup.InferType<typeof schemaPassword>
export type LoginSchema = yup.InferType<typeof schemaLogin>
export type Schema = yup.InferType<typeof schema>
