import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import useAuth from '@/hooks/useAuth';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [cnp, setCnp] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cnp.length !== 13 || !/^\d+$/.test(cnp)) {
      toast.error('CNP must be exactly 13 digits long.');
      return;
    }
    try {
      await register(username, cnp);
      navigate('/login');
    } catch (error) {
      // Error is handled in useAuth hook
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Input
                  id="username"
                  placeholder="Your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Input
                  id="cnp"
                  placeholder="Your CNP (13 digits)"
                  value={cnp}
                  onChange={(e) => setCnp(e.target.value)}
                  required
                  maxLength={13}
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage; 