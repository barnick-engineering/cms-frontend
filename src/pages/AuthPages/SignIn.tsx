import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import { Navigate } from "react-router";

export default function SignIn() {
  return (
    <>
      <PageMeta title="Barnick Pracharani CMS" description="" />
      <AuthLayout>
        {localStorage.getItem("access") ? (
          <Navigate to={"/"} />
        ) : (
          <SignInForm />
        )}
      </AuthLayout>
    </>
  );
}
