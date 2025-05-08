// Inicialização do cliente Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrd3l2bWVpcnB4cWxrcHV5d2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTAxOTAsImV4cCI6MjA2MjI4NjE5MH0.SS_YN3hrLEdRm31p7uiyRC6SkbA_uIm1wCNusNA61AY';
const supabase = createClient(supabaseUrl, supabaseKey);


// Função para converter nomes de propriedades para padrão snake_case usado no PostgreSQL
const converterParaFormatoSupabase = (produto) => {
  return {
    id: produto.id,
    nome: produto.nome,
    descricao: produto.descricao,
    preco: produto.preco,
    preco_original: produto.precoOriginal,
    tem_desconto: produto.temDesconto
  };
};

// Função para inserir os produtos no Supabase
const inserirProdutosNoSupabase = async () => {
  const produtosFormatados = produtos.map(converterParaFormatoSupabase);
  
  try {
    const { data, error } = await supabase
      .from('produtos')
      .insert(produtosFormatados)
      .select();
    
    if (error) {
      console.error('Erro ao inserir produtos:', error);
      return false;
    }
    
    console.log('Produtos inseridos com sucesso:', data);
    return true;
  } catch (err) {
    console.error('Erro na operação:', err);
    return false;
  }
};

// Função para buscar todos os produtos do Supabase
const buscarProdutos = async () => {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
    
    return data;
  } catch (err) {
    console.error('Erro na operação:', err);
    return [];
  }
};

// Função para aplicar desconto a todos os produtos
const aplicarDescontoNoSupabase = async (percentualDesconto = 10) => {
  try {
    // Primeiro, buscar todos os produtos que não têm desconto
    const { data: produtosSemDesconto, error: erroConsulta } = await supabase
      .from('produtos')
      .select('*')
      .eq('tem_desconto', false);
    
    if (erroConsulta) {
      console.error('Erro ao buscar produtos sem desconto:', erroConsulta);
      return false;
    }
    
    // Para cada produto, aplicar o desconto
    for (const produto of produtosSemDesconto) {
      const novoPreco = produto.preco * (1 - percentualDesconto / 100);
      
      const { error: erroAtualizacao } = await supabase
        .from('produtos')
        .update({
          preco: novoPreco,
          tem_desconto: true
        })
        .eq('id', produto.id);
      
      if (erroAtualizacao) {
        console.error(`Erro ao aplicar desconto ao produto ${produto.id}:`, erroAtualizacao);
      }
    }
    
    return true;
  } catch (err) {
    console.error('Erro na operação de desconto:', err);
    return false;
  }
};

// Exemplo de uso das funções
document.addEventListener('DOMContentLoaded', async () => {
  // Inicializar a interface com os produtos do Supabase
  await carregarProdutosDoSupabase();
  
  // Adicionar evento para o botão de desconto
  document.getElementById('aplicarDesconto')?.addEventListener('click', async () => {
    await aplicarDescontoNoSupabase();
    await carregarProdutosDoSupabase();
  });
});

// Função para carregar produtos do Supabase e renderizar na interface
const carregarProdutosDoSupabase = async () => {
  const produtosDoSupabase = await buscarProdutos();
  
  if (produtosDoSupabase.length > 0) {
    // Converter formato do Supabase para o formato da aplicação
    const produtosFormatados = produtosDoSupabase.map(produto => ({
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      precoOriginal: produto.preco_original,
      temDesconto: produto.tem_desconto
    }));
    
    // Renderizar produtos na interface
    renderizarProdutos(produtosFormatados);
  }
};

// Função para renderizar produtos na interface
function renderizarProdutos(produtos) {
  const produtosContainer = document.getElementById('produtos');
  
  if (!produtosContainer) return;
  
  produtosContainer.innerHTML = '';
  
  const produtosHTML = produtos.map(produto => {
    const produtoCard = document.createElement('div');
    produtoCard.className = 'produto-card';
    
    const produtoInfo = document.createElement('div');
    produtoInfo.className = 'produto-info';
    
    const produtoNome = document.createElement('h3');
    produtoNome.className = 'produto-nome';
    produtoNome.textContent = produto.nome;
    
    const produtoDescricao = document.createElement('p');
    produtoDescricao.className = 'produto-descricao';
    produtoDescricao.textContent = produto.descricao;
    
    const produtoPreco = document.createElement('div');
    produtoPreco.className = 'produto-preco';
    
    if (produto.temDesconto) {
      const precoOriginal = document.createElement('span');
      precoOriginal.className = 'preco-original';
      precoOriginal.textContent = formataPreco(produto.precoOriginal);
      
      const precoDesconto = document.createElement('span');
      precoDesconto.className = 'preco-desconto';
      precoDesconto.textContent = formataPreco(produto.preco);
      
      produtoPreco.appendChild(precoOriginal);
      produtoPreco.appendChild(precoDesconto);
    } else {
      produtoPreco.textContent = formataPreco(produto.preco);
    }
    
    produtoInfo.appendChild(produtoNome);
    produtoInfo.appendChild(produtoDescricao);
    produtoInfo.appendChild(produtoPreco);
    
    produtoCard.appendChild(produtoInfo);
    
    return produtoCard;
  });
  
  produtosHTML.forEach(card => {
    produtosContainer.appendChild(card);
  });
}

function formataPreco(preco) {
  return preco.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}