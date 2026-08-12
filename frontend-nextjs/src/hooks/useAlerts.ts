// src/hooks/useAlerts.ts

import Swal from 'sweetalert2';

/**
 * Hook customizado para centralizar todas as interações de UI com o SweetAlert2.
 * Isso garante consistência visual e lógica em todo o sistema.
 */
const useAlerts = () => {

    /**
     * 1. Exibe uma notificação de sucesso (Toast) que desaparece automaticamente.
     * @param message A mensagem a ser exibida.
     */
    const successToast = (message: string) => {
        Swal.fire({
            title: 'Sucesso!',
            text: message,
            icon: 'success',
            position: 'top-end', // Aparece no canto superior direito
            showConfirmButton: false,
            timer: 2000 // Desaparece após 3 segundos
        });
    };

    /**
     * 2. Exibe um alerta de erro que exige que o usuário clique em 'OK'.
     * @param message A mensagem de erro detalhada.
     * @param title O título do alerta (padrão 'Erro!').
     */
    const errorAlert = (message: string, title: string = 'Erro!') => {
        Swal.fire({
            title: title,
            text: message,
            icon: 'error',
        });
    };

    /**
     * 3. Exibe um modal de confirmação para ações críticas.
     * @param title O título do modal.
     * @param text O texto de confirmação (ex: "Tem certeza?").
     * @returns Promise<boolean> Retorna true se confirmado, false se cancelado.
     */
    const confirmAction = async (title: string, text: string): Promise<boolean> => {
        const result = await Swal.fire({
            title: title,
            text: text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33', // Usando vermelho para a ação principal (Excluir)
            cancelButtonColor: '#3085d6', // Usando azul para o 'Cancelar'
            confirmButtonText: 'Sim, continuar',
            cancelButtonText: 'Cancelar'
        });

        return result.isConfirmed;
    };

    return {
        successToast,
        errorAlert,
        confirmAction,
    };
};

export default useAlerts;