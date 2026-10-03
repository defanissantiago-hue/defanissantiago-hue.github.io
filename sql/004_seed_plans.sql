insert into public.plans(name,price,description,features,popular,active,sort_order) values
('Scorpion Base',25000,'Rutina personalizada con seguimiento mensual.','["Rutina personalizada","Registro de cargas","Videos de técnica","Ajuste mensual"]'::jsonb,false,true,1),
('Scorpion Pro',40000,'Seguimiento cercano y ajustes frecuentes.','["Todo lo de Base","Ajustes semanales","Feedback prioritario","Seguimiento de progreso"]'::jsonb,true,true,2),
('Scorpion Elite',60000,'Acompañamiento premium y control completo.','["Todo lo de Pro","Revisión prioritaria","Check-in frecuente","Planificación por bloques"]'::jsonb,false,true,3)
on conflict do nothing;
