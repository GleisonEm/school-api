-- phpMyAdmin SQL Dump
-- version 5.1.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Tempo de geração: 26-Jan-2024 às 20:18
-- Versão do servidor: 5.7.37
-- versão do PHP: 8.0.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

START TRANSACTION;

SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */
;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */
;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */
;
/*!40101 SET NAMES utf8mb4 */
;

--
-- Banco de dados: `school_control`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `attendance_records`
--

CREATE TABLE `attendance_records` (
    `id` int(11) NOT NULL, `class_id` int(11) DEFAULT NULL, `student_id` int(11) DEFAULT NULL, `date` date NOT NULL, `attendance_status` enum(
        'present', 'absent', 'justified'
    ) NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `classes`
--

CREATE TABLE `classes` (
    `id` int(11) NOT NULL, `class_name` varchar(255) NOT NULL, `academic_year` year(4) NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `reports`
--

CREATE TABLE `reports` (
    `id` int(11) NOT NULL, `report_type` varchar(255) NOT NULL, `date` date NOT NULL, `content` text
) ENGINE = InnoDB DEFAULT CHARSET = latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `students`
--

CREATE TABLE `students` (
    `id` int(11) NOT NULL, `birth_date` date DEFAULT NULL, `parent_details` text
) ENGINE = InnoDB DEFAULT CHARSET = latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `teachers`
--

CREATE TABLE `teachers` (
    `id` int(11) NOT NULL, `qualifications` text, `admission_date` date DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `time_control`
--

CREATE TABLE `time_control` (
    `id` int(11) NOT NULL, `teacher_id` int(11) DEFAULT NULL, `entry_datetime` datetime NOT NULL, `exit_datetime` datetime DEFAULT NULL, `total_hours_worked` decimal(5, 2) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `users`
--

CREATE TABLE `users` (
    `id` int(11) NOT NULL, `name` varchar(255) NOT NULL, `email` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, `type` enum(
        'diretoria', 'professor', 'aluno'
    ) NOT NULL, `token` varchar(255), -- Coluna token adicionada
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = latin1;

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `attendance_records`
--
ALTER TABLE `attendance_records`
ADD PRIMARY KEY (`id`),
ADD KEY `class_id` (`class_id`),
ADD KEY `student_id` (`student_id`);

--
-- Índices para tabela `classes`
--
ALTER TABLE `classes` ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `reports`
--
ALTER TABLE `reports` ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `students`
--
ALTER TABLE `students` ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `teachers`
--
ALTER TABLE `teachers` ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `time_control`
--
ALTER TABLE `time_control`
ADD PRIMARY KEY (`id`),
ADD KEY `teacher_id` (`teacher_id`);

--
-- Índices para tabela `users`
--
ALTER TABLE `users` ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `attendance_records`
--
ALTER TABLE `attendance_records`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `classes`
--
ALTER TABLE `classes` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `reports`
--
ALTER TABLE `reports` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `time_control`
--
ALTER TABLE `time_control`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `users`
--
ALTER TABLE `users` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `attendance_records`
--
ALTER TABLE `attendance_records`
ADD CONSTRAINT `attendance_records_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`),
ADD CONSTRAINT `attendance_records_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`);

--
-- Limitadores para a tabela `students`
--
ALTER TABLE `students`
ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`);

--
-- Limitadores para a tabela `teachers`
--
ALTER TABLE `teachers`
ADD CONSTRAINT `teachers_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`);

--
-- Limitadores para a tabela `time_control`
--
ALTER TABLE `time_control`
ADD CONSTRAINT `time_control_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */
;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */
;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */
;