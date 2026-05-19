import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    const [isRegistering, setIsRegistering] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nome, setNome] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "/api/usuario/login",
                { email, password }, { withCredentials: true }
            );

            if(!response.data.success) {
                setMessage("Erro no login");
            } else {
                navigate("/dashboard");
            }
        } catch (error: unknown){
            if(axios.isAxiosError(error) && error.response && error.response.status === 429) {
                setMessage("Você excedeu o número de tentativas. Tente novamente em 15 minutos.");
                return;
            }
            setMessage("Erro no login");
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (!validarSenha(password)) {
                setMessage("A senha deve conter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.");
                return;
            }
            const response = await axios.post(
                "/api/usuario/novo-login",
                { email, password, nome }
            );
            
            if (response.data.success) {
                setMessage("Usuário criado com sucesso!");
                setIsRegistering(false);
            }
        } catch {
            setMessage("Erro no cadastro");
        }
    };
 const validarSenha = (senha: string) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        return regex.test(senha);
    };
    return (
        <div style={styles.container}>
            <h1>{isRegistering ? "Criar Conta" : "Login"}</h1>

            <form
                onSubmit={isRegistering ? handleRegister : handleLogin}
                style={styles.form}
            >
                {isRegistering && (
                    <input
                        type="text"
                        placeholder="Nome Completo"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        style={styles.input}
                        required
                    />
                )}

                <input
                    type="text"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                    required
                />

                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                    required
                />

                <button type="submit" style={styles.button}>
                    {isRegistering ? "Cadastrar" : "Entrar"}
                </button>
            </form>

            <p style={{ marginTop: 10 }}>{message}</p>

            <button
                onClick={() => {
                    setMessage("");
                    setIsRegistering(!isRegistering);
                }}
                style={styles.linkButton}
            >
                {isRegistering
                    ? "Já tem conta? Fazer login"
                    : "Não tem conta? Criar uma"}
            </button>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "Arial",
    },
    form: {
        display: "flex",
        flexDirection: "column" as const,
        width: "320px",
    },
    input: {
        marginBottom: "10px",
        padding: "8px",
        fontSize: "16px",
    },
    button: {
        padding: "10px",
        fontSize: "16px",
        cursor: "pointer",
    },
    linkButton: {
        marginTop: "15px",
        background: "none",
        border: "none",
        color: "blue",
        cursor: "pointer",
        textDecoration: "underline",
    },
};

export default Login;