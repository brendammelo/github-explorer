import React, { useState, FormEvent, useEffect } from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { promises } from 'fs';
import { Title, Form, Repositories, Error } from './styles';

import api from '../../services/api';

import logoImg from '../../assets/logo.svg';

interface Repository {
  full_name: string;
  description: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

const Dashboard: React.FC = () => {
  const [form, setForm] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>(() => {
    const storagedRepositories = localStorage.getItem(
      '@GithubExplorer:repositories',
    );

    if (storagedRepositories) {
      return JSON.parse(storagedRepositories);
    }
    return [];
  });
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem(
      '@GithubExplorer:repositories',
      JSON.stringify(repositories),
    );
  }, [repositories]);

  async function handleAddRepository(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!form) {
      setError('Digite nome de repositório válido.');
      return;
    }

    try {
      const response = await api.get<Repository>(`repos/${form}`);

      const newRepo = response.data;

      setRepositories([
        ...repositories,
        {
          full_name: newRepo.full_name,
          description: newRepo.description,
          owner: {
            login: newRepo.owner.login,
            avatar_url: newRepo.owner.avatar_url,
          },
        },
      ]);
      setForm('');
      setError('');
    } catch {
      setError('Repositório não encontrado.');
    }
  }

  return (
    <>
      <img src={logoImg} alt="Github Explorer" />
      <Title>Explore respositórios no Github</Title>
      <Form hasError={!!error} onSubmit={handleAddRepository}>
        <input
          value={form}
          onChange={e => setForm(e.target.value)}
          placeholder="Digite o nome do repositório. Ex: facebook/react"
        />
        <button type="submit">Pesquisar</button>
      </Form>
      <Error>{error}</Error>
      {repositories.map(({ full_name, description, owner }) => (
        <Repositories>
          <Link key={full_name} to={`/repositories/${full_name}`}>
            <img src={owner.avatar_url} alt={owner.login} />
            <div>
              <strong>{full_name}</strong>
              <p>{description}</p>
            </div>
            <FiChevronRight size={20} />
          </Link>
        </Repositories>
      ))}
    </>
  );
};

export default Dashboard;
