import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PATH } from "@/constants/path";

export function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Welcome to User Registration
          </CardTitle>
          <CardDescription>
            A complete user registration system with React and NestJS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link to={PATH.SIGNUP}>Sign Up</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to={PATH.LOGIN}>Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
