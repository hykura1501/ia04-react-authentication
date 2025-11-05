import { Link } from "react-router-dom";
import { PATH } from "@/constants/path";

export function Home() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome</h1>
      <div className="space-x-4">
        <Link to={PATH.SIGNUP}>Sign Up</Link>
        <Link to={PATH.LOGIN}>Login</Link>
      </div>
    </div>
  );
}
