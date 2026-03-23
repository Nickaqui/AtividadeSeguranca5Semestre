import axios from "axios";
import { useEffect, useState } from "react";

import type { Iptuu } from "./Tipos/Iptuu";

function Gerenciamento() {

  //const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [iptus, setIptus] = useState<Iptuu[]>([]);
  const [novoValor, setNovoValor] = useState<{ [key: number]: number }>({});
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {

    const buscarIptus = async () => {

      try {

        const response = await axios.get<{ iptu: Iptuu[] }>(
          "http://localhost:3001/usuario/iptus"
        );

        setIptus(response.data.iptu);

      } catch (error) {
        console.error("Erro ao buscar IPTUs", error);
      }

    };

    buscarIptus();

  }, []);

  const atualizarIptu = async (usuarioId: number) => {

    try {

      await axios.put(
        "http://localhost:3001/usuario/atualizar-iptu",
        {
          usuarioId: usuarioId,
          novoValor: novoValor[usuarioId]
        }
      );

      alert("IPTU atualizado");

      // Atualiza lista novamente
      const response = await axios.get<{ iptu: Iptuu[] }>(
        "http://localhost:3001/iptu"
      );

      setIptus(response.data.iptu);

    } catch (error) {

      console.error("Erro ao atualizar IPTU", error);

    }

  };

  return (

    <div style={styles.container}>

      <header style={styles.header}>

        <h2>Gerenciamento de IPTUs</h2>

        <div style={{ position: "relative" }}>

          <button onClick={() => setMenuAberto(!menuAberto)}>
            ☰ Menu
          </button>

          {menuAberto && (
            <div style={styles.dropdown}>

              <button onClick={() => window.location.href = "/dashboard"}>
                Voltar ao Dashboard
              </button>

            </div>
          )}

        </div>

      </header>

      <h3 style={{ marginTop: "40px" }}>
        Lista de Munícipes e IPTUs
      </h3>

      {iptus.map((iptu) => (

        <div key={iptu.id} style={styles.card}>

          <p>
            <strong>Munícipe:</strong> {iptu.nome}
          </p>

          <p>
            <strong>Usuário ID:</strong> {iptu.usuario_id}
          </p>

          <p>
            <strong>Valor Atual:</strong> {iptu.valor}
          </p>

          <input
            type="number"
            placeholder="Novo valor"
            onChange={(e) =>
              setNovoValor({
                ...novoValor,
                [iptu.usuario_id]: Number(e.target.value)
              })
            }
          />

          <button
            onClick={() =>
              atualizarIptu(iptu.usuario_id)
            }
          >
            Atualizar IPTU
          </button>

        </div>

      ))}

    </div>

  );
}

const styles = {

  container: {
    padding: "40px",
    fontFamily: "Arial"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  card: {
    marginTop: "20px",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    width: "320px"
  },

  dropdown: {
    position: "absolute" as const,
    top: "40px",
    right: 0,
    background: "white",
    border: "1px solid #ccc",
    display: "flex",
    flexDirection: "column" as const,
    padding: "10px",
    gap: "5px"
  }

};

export default Gerenciamento;