import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [valor_total, setValorTotal] = useState(0);
  const [receitas, setReceitas] = useState(0);
  const [despesas, setDespesas] = useState(0);
  const [extrato, setExtrato] = useState([]);
  const [tipoBusca, setTipoBusca] = useState('');
  
  const [exibirForm, setExibirForm] = useState(false);
  const [formValues, setFormValues] = useState({
    tipo: '',
    valor: '',
    status: '0', // 0 para Despesa, 1 para Receita
  });
  
  const apiURL = process.env.REACT_APP_API_HOST;

  const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const corStatus = (status) => {
    return status === 1 ? '#00cc00' : '#cc0000';
  };

  const formatarStatus = (status) => {
    return status === 1 ? 'Receita' : 'Despesa';
  };

  const handleSubmitCadastrar = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${apiURL}/api/caixas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formValues),
      });
      if (response.ok) {
        // Recarregar os dados após o cadastro bem-sucedido
        carregarDados();
        // Esconder o formulário
        setExibirForm(false);
        // Limpar os valores do formulário
        setFormValues({
          tipo: '',
          valor: '',
          status: '0',
        });
      } else {
        console.error('Erro ao cadastrar lançamento');
      }
    } catch (error) {
      console.error('Erro ao cadastrar lançamento:', error);
    }
  };

  const carregarDados = async (tipo = '') => {
    try {
      const response = await fetch(`${apiURL}/api/caixas${tipo ? `?tipo=${tipo}` : ''}`);
      const data = await response.json();

      setValorTotal(data.valor_total);
      setReceitas(data.receitas);
      setDespesas(data.despesas);
      setExtrato(data.extrato);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    carregarDados(tipoBusca);
  };


  const excluirLancamento = async (id) => {
    if(window.confirm("Confirma ?")){
      try {
        const response = await fetch(`${apiURL}/api/caixas/${id}`, { method: 'DELETE' });
        if (response.ok) {
          // Recarregar os dados após a exclusão bem-sucedida
          carregarDados();
        } else {
          console.error('Erro ao excluir lançamento');
        }
      } catch (error) {
        console.error('Erro ao excluir lançamento:', error);
      }
    }
  };

  useEffect(() => {
    // Carregar os dados da API quando o componente for montado
    carregarDados();
  }, []);

  return (
    <div>
      <h1>Fluxo de caixa Node.js</h1>
      <hr />

      <div className="dvCaixas">
        <div>
          <b>Valor total</b>
          <br />
          <span id="valorTotal">{formatarMoeda(valor_total)}</span>
        </div>
        <div>
          <b>Receitas</b>
          <br />
          <span id="receitas">{formatarMoeda(receitas)}</span>
        </div>
        <div>
          <b>Despesas</b>
          <br />
          <span id="despesas">{formatarMoeda(despesas)}</span>
        </div>
      </div>

      <div className="dvSerach">
        <div>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Digite algo ..."
              className="form-control"
              name="tipo"
              value={tipoBusca}
              onChange={(e) => setTipoBusca(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Buscar
            </button>
          </form>
        </div>
        <div>
          <button className="btn btn-primary mt-3" onClick={() => setExibirForm(true)}>
            Adicionar
          </button>
        </div>
      </div>

      {exibirForm && (
        <form className="formCadastrar" onSubmit={handleSubmitCadastrar}>
          <div className="form-group">
            <label htmlFor="tipo">Tipo</label>
            <input
              type="text"
              className="form-control"
              id="tipo"
              name="tipo"
              value={formValues.tipo}
              onChange={(e) => setFormValues({ ...formValues, tipo: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="valor">Valor</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              id="valor"
              name="valor"
              value={formValues.valor}
              onChange={(e) => setFormValues({ ...formValues, valor: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              className="form-control"
              id="status"
              name="status"
              value={formValues.status}
              onChange={(e) => setFormValues({ ...formValues, status: e.target.value })}
              required
            >
              <option value="0">Despesa</option>
              <option value="1">Receita</option>
            </select>
          </div>
          <br />
          <button type="submit" className="btn btn-primary">
            Cadastrar
          </button>
        </form>
      )}


      <div className="dvTabela">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {extrato.map((lancamento) => (
              <tr key={lancamento.id}>
                <td>{lancamento.tipo}</td>
                <td>{formatarMoeda(lancamento.valor)}</td>
                <td style={{ backgroundColor: corStatus(lancamento.status) }}>{formatarStatus(lancamento.status)}</td>
                <td style={{ width: '20px' }}>
                  <button onClick={() => excluirLancamento(lancamento.id)} className="btn btn-danger">
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
