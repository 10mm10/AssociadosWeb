const bcrypt = require('bcrypt');

const senha = '123'; // SUBSTITUA AQUI PELA SENHA QUE VOCÊ VAI USAR
const saltRounds = 10; // Nível de segurança do hash, 10 é um bom padrão

// Gera o hash da senha de forma assíncrona
bcrypt.hash(senha, saltRounds, (err, hash) => {
    if (err) {
        console.error('Erro ao gerar o hash:', err);
        return;
    }
    console.log('Senha hasheada:');
    console.log(hash);
});