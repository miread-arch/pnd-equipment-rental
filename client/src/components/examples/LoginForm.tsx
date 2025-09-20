import LoginForm from '../LoginForm';

export default function LoginFormExample() {
  const handleLogin = (daouId: string, name: string, department: string) => {
    console.log('Login attempted:', { daouId, name, department });
  };

  return <LoginForm onLogin={handleLogin} />;
}