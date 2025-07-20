import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, AdminPanelSettings } from '@mui/icons-material';
import { useAdminAuth } from '../../hooks/auth/auth.hooks';
import {
  AdminLoginContainer,
  AdminLoginPaper,
  AdminFormField,
  AdminHeaderBox,
  AdminTitle,
  AdminSubtitle,
  AdminLoginButton,
  AdminAlert,
  AdminCaption,
  AdminIconStyle
} from '../../styles/auth/auth.style';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const AdminLoginForm = () => {
  const { login, isLoading, error, success, clearAuthMessages } = useAdminAuth();
  const [showPassword, setShowPassword] = React.useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      await login(values);
    },
  });

  const handleInputChange = (field) => (event) => {
    formik.handleChange(event);
    if (error) {
      clearAuthMessages();
    }
  };

  return (
    <AdminLoginContainer>
      <AdminLoginPaper>
        <AdminHeaderBox>
          <AdminPanelSettings sx={AdminIconStyle} />
          <AdminTitle variant="h4" component="h1">
            Admin Panel
          </AdminTitle>
          <AdminSubtitle variant="body2">
            Authorized Access Only
          </AdminSubtitle>
        </AdminHeaderBox>

        {error && (
          <AdminAlert severity="error">
            {error}
          </AdminAlert>
        )}

        {success && (
          <AdminAlert severity="success">
            {success}
          </AdminAlert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <AdminFormField
            fullWidth
            id="email"
            name="email"
            label="Admin Email"
            type="email"
            value={formik.values.email}
            onChange={handleInputChange('email')}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            disabled={isLoading}
          />

          <AdminFormField
            fullWidth
            id="password"
            name="password"
            label="Admin Password"
            type={showPassword ? 'text' : 'password'}
            value={formik.values.password}
            onChange={handleInputChange('password')}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    disabled={isLoading}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <AdminLoginButton
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Admin Login'}
          </AdminLoginButton>
        </form>

        <AdminCaption variant="caption">
          For authorized personnel only
        </AdminCaption>
      </AdminLoginPaper>
    </AdminLoginContainer>
  );
};

export default AdminLoginForm;