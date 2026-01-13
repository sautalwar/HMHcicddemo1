-- Create Azure AD user in database
CREATE USER [admin@MngEnvMCAP557563.onmicrosoft.com] FROM EXTERNAL PROVIDER;
GO

-- Grant db_owner role
ALTER ROLE db_owner ADD MEMBER [admin@MngEnvMCAP557563.onmicrosoft.com];
GO
