import { useState } from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import axios from "axios";
import { useNavigate } from "react-router";
import toast, { Toaster } from "react-hot-toast";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // set email and pass
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // handle login
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${backendUrl}/account/login/`, {
        email,
        password,
      });
      localStorage.setItem("access", response?.data?.access);
      localStorage.setItem("refresh", response?.data?.refresh);

      // call and save user data
      const userResponse = await axios.get(`${backendUrl}/account/whoami/`, {
        headers: {
          Authorization: `Bearer ${response?.data?.access}`,
        },
      });
      localStorage.setItem("user", JSON.stringify(userResponse?.data?.data));
      toast.success("Login successful!");
      // navigate to dashboard
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Toaster position="bottom-right" />
      <div className="flex flex-col flex-1">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div>
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md text-center">
                Barnick Sign In
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Enter your email and password to sign in!
              </p>
            </div>
            <div>
              <form onSubmit={handleLogin}>
                <div className="space-y-6">
                  <div>
                    <Label>
                      Email <span className="text-error-500">*</span>{" "}
                    </Label>
                    <Input
                      placeholder="info@gmail.com"
                      name="email"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>
                      Password <span className="text-error-500">*</span>{" "}
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        )}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Button className="w-full" size="sm">
                      Sign in
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
