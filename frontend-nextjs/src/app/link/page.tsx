"use client";
export const dynamic = "force-dynamic";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { IMaskInput } from "react-imask";
import Swal from "sweetalert2";
import useAlerts from "@/hooks/useAlerts";
interface FormData {
    numero: string;
    id: string;
    nome: string;
    rg: string;
    data_nascimento: string;
    teleitor: string;
    cnpj: string;
    endereco: string;
    cep: string;
    bairro: string;
    cidade: string;
    estado: string;
    telefone: string;
    celular: string;
    email: string;
    estado_civil: string;
    conjuge: string;
    cpf_conjuge: string;
    rg_conjuge: string;
    status: string;
    cpf?: string;
    razao_social?: string;
    inscricao_estadual?: string;
    representante_nome?: string;
    representante_cpf?: string;
    representante_cargo?: string;
    representante_celular?: string;
    representante_email?: string;
    representante_nacionalidade?: string;
    representante_profissao?: string;
    representante_rg?: string;
    representante_estado_civil?: string;
    nome_fantasia?: string;
    token: string;
    nacionalidade: string;
    profissao: string;
    ctps: string;
    aceite: boolean;
    tipo?: "fisica" | "juridica";
}
const initialFormData: FormData = {
    id: "",
    nome: "",
    cnpj: "",
    status: "",
    endereco: "",
    rg: "",
    data_nascimento: "",
    token: "",
    email: "",
    cep: "",
    bairro: "",
    cidade: "",
    estado: "",
    conjuge: "",
    telefone: "",
    celular: "",
    nacionalidade: "",
    profissao: "",
    ctps: "",
    teleitor: "",
    estado_civil: "",
    cpf_conjuge: "",
    rg_conjuge: "",
    aceite: false,
    numero: "",
};
const cpfMask = "000.000.000-00";
const cnpjMask = "00.000.000/0000-00";
const cepMask = "00000-000";
const telefoneMask = "(00) 0000-0000";
const celularMask = "(00) 00000-0000";
const estados = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
];
function CompletarCadastroContent() {
    const { errorAlert } = useAlerts();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [formData, setFormData] =
        useState<FormData>(initialFormData);
    const [loading, setLoading] =
        useState(true);
    const [error, setError] =
        useState<string | null>(null);
    useEffect(() => {
        const verificarToken = async () => {
            if (!token) {
                setLoading(false);
                setError(
                    "Token de acesso não fornecido."
                );
                return;
            }
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/verificar-token?token=${token}`
                );
                const data =
                    await response.json();
                if (!response.ok) {
                    throw new Error(
                        data.error ||
                        "Erro na verificação do token."
                    );
                }
                setFormData({
                    ...initialFormData,
                    ...data.cliente,
                    token,
                    aceite: false,
                });
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Erro ao carregar dados do cliente."
                );
            } finally {
                setLoading(false);
            }
        };
        verificarToken();
    }, [token]);
    const handleInputChange = (
        e: React.ChangeEvent<
            | HTMLInputElement
            | HTMLSelectElement
            | HTMLTextAreaElement
        >
    ) => {
        const {
            name,
            value,
            type
        } = e.target;
        const inputValue =
            type === "checkbox"
                ? (e.target as HTMLInputElement).checked
                : value;
        setFormData((prev) => ({
            ...prev,
            [name]: inputValue,
        }));
    };
    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        if (!token) {
            const msg =
                "Dados de cliente ou token ausentes.";
            setError(msg);
            errorAlert(
                msg,
                "Erro de Formulário"
            );
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/completar-cadastro`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify(
                        formData
                    ),
                }
            );
            const data =
                await response.json();
            if (!response.ok) {
                let userMessage =
                    "Ocorreu um erro no cadastro. Por favor, tente novamente.";
                if (
                    data.error &&
                    typeof data.error === "string"
                ) {
                    userMessage =
                        data.error;
                } else if (
                    data.message &&
                    typeof data.message ===
                        "string"
                ) {
                    userMessage =
                        data.message;
                }
                if (
                    response.status === 409
                ) {
                    userMessage =
                        "Erro de Conflito: O CPF, RG ou CNPJ pode já estar cadastrado. Verifique os dados.";
                } else if (
                    response.status === 400
                ) {
                    userMessage =
                        `Dados inválidos: ${userMessage}`;
                }
                throw new Error(
                    userMessage
                );
            }
            const result =
                await Swal.fire({
                    title: "Sucesso!",
                    text:
                        "Cadastro finalizado com sucesso! De uma olhada em nosso site! Obrigado!",
                    icon: "success",
                    showConfirmButton: true,
                });
            if (result.isConfirmed) {
                window.location.href =
                    "/";
            }
        } catch (err) {
            const msg =
                err instanceof Error
                    ? err.message
                    : "Erro de conexão ou formato de resposta inválido.";
            setError(msg);
            errorAlert(
                msg,
                "Falha ao Finalizar Cadastro"
            );
        } finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-slate-100">
                <div className="rounded-lg border border-slate-200 bg-white px-6 py-4 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Carregando...
                    </p>
                </div>
            </div>
        );
    }
    if (
        error &&
        !formData.nome &&
        !formData.razao_social
    ) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 p-4">
                <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
                    <h2 className="mb-2 text-lg font-semibold text-red-600">
                        Não foi possível acessar o cadastro
                    </h2>
                    <p className="text-sm text-slate-600">
                        {error}
                    </p>
                </div>
            </div>
        );
    }
    const dateOnly =
        formData.data_nascimento
            ?.split("T")[0] || "";
    const inputClass =
        "h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
    const labelClass =
        "flex min-w-0 flex-col gap-1 text-xs font-medium text-slate-600";
    return (
        <div className="min-h-screen w-full bg-slate-100 px-3 py-5 sm:px-5 sm:py-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {/* CABEÇALHO */}
                <header className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
                    <h1 className="text-xl font-semibold text-slate-800 sm:text-2xl">
                        Olá,{" "}
                        {formData.nome ||
                            formData.razao_social}
                        !
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Confira as informações e
                        complete os dados abaixo para
                        finalizar seu cadastro.
                    </p>
                </header>
                {/* ERRO */}
                {error && (
                    <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6">
                        <span className="font-semibold">
                            Erro no cadastro:{" "}
                        </span>
                        {error}
                    </div>
                )}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 p-5 sm:p-6"
                >
                    {/* ==================================================
                        PESSOA FÍSICA
                    =================================================== */}
                    {formData.tipo ===
                        "fisica" && (
                        <section>
                            <div className="mb-4 border-b border-slate-200 pb-2">
                                <h2 className="text-base font-semibold text-slate-700">
                                    Dados Pessoais
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                                <label
                                    className={`${labelClass} sm:col-span-2`}
                                >
                                    Nome Completo
                                    <input
                                        type="text"
                                        name="nome"
                                        value={
                                            formData.nome ||
                                            ""
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                        className={
                                            inputClass
                                        }
                                    />
                                </label>
                                <label className={labelClass}>
                                    CPF
                                    <IMaskInput
                                        mask={
                                            cpfMask
                                        }
                                        name="cpf"
                                        value={
                                            formData.cpf ||
                                            ""
                                        }
                                        onAccept={(
                                            value
                                        ) =>
                                            setFormData(
                                                {
                                                    ...formData,
                                                    cpf:
                                                        value,
                                                }
                                            )
                                        }
                                        required
                                        className={
                                            inputClass
                                        }
                                    />
                                </label>
                                <label className={labelClass}>
                                    RG
                                    <IMaskInput
                                        mask={
                                            /^\d{0,15}$/
                                        }
                                        name="rg"
                                        value={
                                            formData.rg ||
                                            ""
                                        }
                                        onAccept={(
                                            value
                                        ) =>
                                            setFormData(
                                                {
                                                    ...formData,
                                                    rg:
                                                        value,
                                                }
                                            )
                                        }
                                        required
                                        className={
                                            inputClass
                                        }
                                    />
                                </label>
                                <label className={labelClass}>
                                    Data de Nascimento
                                    <input
                                        type="date"
                                        id="data_nascimento"
                                        name="data_nascimento"
                                        value={
                                            dateOnly
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                        className={
                                            inputClass
                                        }
                                    />
                                </label>
                                <label className={labelClass}>
                                    Nacionalidade
                                    <input
                                        type="text"
                                        name="nacionalidade"
                                        value={
                                            formData.nacionalidade ||
                                            ""
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                        className={
                                            inputClass
                                        }
                                    />
                                </label>
                                <label className={labelClass}>
                                    Profissão
                                    <input
                                        type="text"
                                        name="profissao"
                                        value={
                                            formData.profissao ||
                                            ""
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                        className={
                                            inputClass
                                        }
                                    />
                                </label>
                                <label className={labelClass}>
                                    CTPS
                                    <input
                                        type="text"
                                        name="ctps"
                                        value={
                                            formData.ctps ||
                                            ""
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                        className={
                                            inputClass
                                        }
                                    />
                                </label>
                                <label className={labelClass}>
                                    Título de Eleitor
                                    <input
                                        type="text"
                                        name="teleitor"
                                        value={
                                            formData.teleitor ||
                                            ""
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                        className={
                                            inputClass
                                        }
                                    />
                                </label>
                                <label className={labelClass}>
                                    Estado Civil
                                    <input
                                        type="text"
                                        name="estado_civil"
                                        value={
                                            formData.estado_civil ??
                                            ""
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                        className={
                                            inputClass
                                        }
                                    />
                                </label>
                                <label className={labelClass}>
                                    Cônjuge
                                    <input
                                        type="text"
                                        name="conjuge"
                                        value={
                                            formData.conjuge ??
                                            ""
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        className={
                                            inputClass
                                        }
                                    />
                                </label>
                                <label className={labelClass}>
                                    CPF Cônjuge
                                    <IMaskInput
                                        mask={
                                            cpfMask
                                        }
                                        name="cpf_conjuge"
                                        value={
                                            formData.cpf_conjuge ||
                                            ""
                                        }
                                        onAccept={(
                                            value
                                        ) =>
                                            setFormData(
                                                {
                                                    ...formData,
                                                    cpf_conjuge:
                                                        value,
                                                }
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                    />
                                </label>
                                <label className={labelClass}>
                                    RG Cônjuge
                                    <IMaskInput
                                        mask={
                                            /^\d{0,15}$/
                                        }
                                        name="rg_conjuge"
                                        value={
                                            formData.rg_conjuge ||
                                            ""
                                        }
                                        onAccept={(
                                            value
                                        ) =>
                                            setFormData(
                                                {
                                                    ...formData,
                                                    rg_conjuge:
                                                        value,
                                                }
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                    />
                                </label>
                            </div>
                        </section>
                    )}
                    {/* ==================================================
                        PESSOA JURÍDICA
                    =================================================== */}
                    {formData.tipo ===
                        "juridica" && (
                        <>
                            <section>
                                <div className="mb-4 border-b border-slate-200 pb-2">
                                    <h2 className="text-base font-semibold text-slate-700">
                                        Dados da Empresa
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                                    <label className={`${labelClass} lg:col-span-2`}>
                                        Razão Social
                                        <input
                                            type="text"
                                            name="razao_social"
                                            value={
                                                formData.razao_social ||
                                                ""
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                            className={
                                                inputClass
                                            }
                                        />
                                    </label>
                                    <label className={labelClass}>
                                        Nome Fantasia
                                        <input
                                            type="text"
                                            name="nome_fantasia"
                                            value={
                                                formData.nome_fantasia ||
                                                ""
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                            className={
                                                inputClass
                                            }
                                        />
                                    </label>
                                    <label className={labelClass}>
                                        CNPJ
                                        <IMaskInput
                                            mask={
                                                cnpjMask
                                            }
                                            name="cnpj"
                                            value={
                                                formData.cnpj ||
                                                ""
                                            }
                                            onAccept={(
                                                value
                                            ) =>
                                                setFormData(
                                                    {
                                                        ...formData,
                                                        cnpj:
                                                            value,
                                                    }
                                                )
                                            }
                                            required
                                            className={
                                                inputClass
                                            }
                                        />
                                    </label>
                                    <label className={labelClass}>
                                        Inscrição Estadual
                                        <input
                                            type="text"
                                            name="inscricao_estadual"
                                            value={
                                                formData.inscricao_estadual ||
                                                ""
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                            className={
                                                inputClass
                                            }
                                        />
                                    </label>
                                </div>
                            </section>
                            {/* REPRESENTANTE */}
                            <section>
                                <div className="mb-4 border-b border-slate-200 pb-2">
                                    <h2 className="text-base font-semibold text-slate-700">
                                        Dados do Representante
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                                    <label className={labelClass}>
                                        Nome do Representante
                                        <input
                                            type="text"
                                            name="representante_nome"
                                            value={
                                                formData.representante_nome ||
                                                ""
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            className={
                                                inputClass
                                            }
                                        />
                                    </label>
                                    <label className={labelClass}>
                                        CPF Representante
                                        <IMaskInput
                                            mask={
                                                cpfMask
                                            }
                                            name="representante_cpf"
                                            value={
                                                formData.representante_cpf ||
                                                ""
                                            }
                                            onAccept={(
                                                value
                                            ) =>
                                                setFormData(
                                                    {
                                                        ...formData,
                                                        representante_cpf:
                                                            value,
                                                    }
                                                )
                                            }
                                            required
                                            className={
                                                inputClass
                                            }
                                        />
                                    </label>
                                    <label className={labelClass}>
                                        RG Representante
                                        <IMaskInput
                                            mask={
                                                /^\d{0,15}$/
                                            }
                                            name="representante_rg"
                                            value={
                                                formData.representante_rg ||
                                                ""
                                            }
                                            onAccept={(
                                                value
                                            ) =>
                                                setFormData(
                                                    {
                                                        ...formData,
                                                        representante_rg:
                                                            value,
                                                    }
                                                )
                                            }
                                            required
                                            className={
                                                inputClass
                                            }
                                        />
                                    </label>
                                    <label className={labelClass}>
                                        Nacionalidade
                                        <input
                                            type="text"
                                            name="representante_nacionalidade"
                                            value={
                                                formData.representante_nacionalidade ||
                                                ""
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                            className={
                                                inputClass
                                            }
                                        />
                                    </label>
                                    <label className={labelClass}>
                                        Estado Civil
                                        <input
                                            type="text"
                                            name="representante_estado_civil"
                                            value={
                                                formData.representante_estado_civil ||
                                                ""
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                            className={
                                                inputClass
                                            }
                                        />
                                    </label>
                                    <label className={labelClass}>
                                        Profissão
                                        <input
                                            type="text"
                                            name="representante_profissao"
                                            value={
                                                formData.representante_profissao ||
                                                ""
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                            className={
                                                inputClass
                                            }
                                        />
                                    </label>
                                    <label className={labelClass}>
                                        Cargo
                                        <input
                                            type="text"
                                            name="representante_cargo"
                                            value={
                                                formData.representante_cargo ||
                                                ""
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                            className={
                                                inputClass
                                            }
                                        />
                                    </label>
                                    <label className={labelClass}>
                                        E-mail Representante
                                        <input
                                            type="email"
                                            name="representante_email"
                                            value={
                                                formData.representante_email ||
                                                ""
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            className={
                                                inputClass
                                            }
                                        />
                                    </label>
                                    <label className={labelClass}>
                                        Celular Representante
                                        <IMaskInput
                                            mask={
                                                celularMask
                                            }
                                            name="representante_celular"
                                            value={
                                                formData.representante_celular ||
                                                ""
                                            }
                                            onAccept={(
                                                value
                                            ) =>
                                                setFormData(
                                                    {
                                                        ...formData,
                                                        representante_celular:
                                                            value,
                                                    }
                                                )
                                            }
                                            required
                                            className={
                                                inputClass
                                            }
                                        />
                                    </label>
                                </div>
                            </section>
                        </>
                    )}
                    {/* ==================================================
                        CONTATO
                    =================================================== */}
                    <section>
                        <div className="mb-4 border-b border-slate-200 pb-2">
                            <h2 className="text-base font-semibold text-slate-700">
                                Dados de Contato
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                            <label className={labelClass}>
                                E-mail
                                <input
                                    type="email"
                                    name="email"
                                    value={
                                        formData.email
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                    className={
                                        inputClass
                                    }
                                />
                            </label>
                            <label className={labelClass}>
                                Telefone
                                <IMaskInput
                                    mask={
                                        telefoneMask
                                    }
                                    name="telefone"
                                    value={
                                        formData.telefone
                                    }
                                    onAccept={(
                                        value
                                    ) =>
                                        setFormData(
                                            {
                                                ...formData,
                                                telefone:
                                                    value,
                                            }
                                        )
                                    }
                                    className={
                                        inputClass
                                    }
                                />
                            </label>
                            <label className={labelClass}>
                                Celular
                                <IMaskInput
                                    mask={
                                        celularMask
                                    }
                                    name="celular"
                                    value={
                                        formData.celular
                                    }
                                    onAccept={(
                                        value
                                    ) =>
                                        setFormData(
                                            {
                                                ...formData,
                                                celular:
                                                    value,
                                            }
                                        )
                                    }
                                    required
                                    className={
                                        inputClass
                                    }
                                />
                            </label>
                        </div>
                    </section>
                    {/* ==================================================
                        LOCALIZAÇÃO
                    =================================================== */}
                    <section>
                        <div className="mb-4 border-b border-slate-200 pb-2">
                            <h2 className="text-base font-semibold text-slate-700">
                                Dados de Localização
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                            <label className={labelClass}>
                                CEP
                                <IMaskInput
                                    mask={
                                        cepMask
                                    }
                                    name="cep"
                                    value={
                                        formData.cep
                                    }
                                    onAccept={(
                                        value
                                    ) =>
                                        setFormData(
                                            {
                                                ...formData,
                                                cep:
                                                    value,
                                            }
                                        )
                                    }
                                    required
                                    className={
                                        inputClass
                                    }
                                />
                            </label>
                            <label className={`${labelClass} lg:col-span-2`}>
                                Endereço
                                <input
                                    type="text"
                                    name="endereco"
                                    value={
                                        formData.endereco ??
                                        ""
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                    className={
                                        inputClass
                                    }
                                />
                            </label>
                            <label className={labelClass}>
                                Número
                                <input
                                    type="text"
                                    name="numero"
                                    value={
                                        formData.numero ??
                                        ""
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                    className={
                                        inputClass
                                    }
                                />
                            </label>
                            <label className={labelClass}>
                                Bairro
                                <input
                                    type="text"
                                    name="bairro"
                                    value={
                                        formData.bairro ??
                                        ""
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                    className={
                                        inputClass
                                    }
                                />
                            </label>
                            <label className={labelClass}>
                                Cidade
                                <input
                                    type="text"
                                    name="cidade"
                                    value={
                                        formData.cidade ??
                                        ""
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                    className={
                                        inputClass
                                    }
                                />
                            </label>
                            <label className={labelClass}>
                                Estado
                                <select
                                    name="estado"
                                    value={
                                        formData.estado ??
                                        ""
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                    className={
                                        inputClass
                                    }
                                >
                                    <option value="">
                                        Selecione um estado
                                    </option>
                                    {estados.map(
                                        (
                                            estado
                                        ) => (
                                            <option
                                                key={
                                                    estado
                                                }
                                                value={
                                                    estado
                                                }
                                            >
                                                {
                                                    estado
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </label>
                        </div>
                    </section>
                    {/* ==================================================
                        CONFIRMAÇÃO
                    =================================================== */}
                    <section className="border-t border-slate-200 pt-5">
                        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                            <label
                                htmlFor="aceite"
                                className="flex cursor-pointer items-start gap-3 text-sm text-slate-700"
                            >
                                <input
                                    type="checkbox"
                                    id="aceite"
                                    name="aceite"
                                    checked={
                                        formData.aceite
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-blue-600"
                                />
                                <span>
                                    Eu confirmo que
                                    conferi os dados acima
                                    e concordo com as
                                    informações fornecidas.
                                </span>
                            </label>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={
                                    loading
                                }
                                className="inline-flex h-10 min-w-[190px] items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading
                                    ? "Finalizando..."
                                    : "Finalizar Cadastro"}
                            </button>
                        </div>
                    </section>
                </form>
            </div>
        </div>
    );
}

export default function CompletarCadastro() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen w-full items-center justify-center bg-slate-100">
                    <div className="rounded-lg border border-slate-200 bg-white px-6 py-4 shadow-sm">
                        <p className="text-sm text-slate-500">
                            Carregando formulário...
                        </p>
                    </div>
                </div>
            }
        >
            <CompletarCadastroContent />
        </Suspense>
    );
}