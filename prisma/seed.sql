-- Seeds para inicializar datos básicos

-- Insertar roles
INSERT INTO roles (nombre, descripcion) VALUES
('estudiante', 'Estudiante de trabajo de titulación'),
('tutor', 'Tutor académico guía del estudiante'),
('director', 'Director de carrera - aprueba temas y valida'),
('coordinador', 'Coordinador académico - apoya en revisiones'),
('comite', 'Miembro del comité evaluador');

-- Insertar prerrequisitos
INSERT INTO prerequisitos (nombre, descripcion) VALUES
('Inglés', 'Aprobar requisito de inglés'),
('Prácticas Laborales', 'Completar horas de prácticas profesionales'),
('Vinculación', 'Aprobar proyecto de vinculación con la sociedad');
