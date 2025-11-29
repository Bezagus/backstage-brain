1. El MVP (La Solución)
Nombre sugerido: Backstage Brain (o el que elijas)

El objetivo del MVP no es tener todas las funciones, sino demostrar que el flujo de información funciona: De un archivo estático a una respuesta inteligente.

A. Módulo de Ingesta (El "Input")
Roles:

Admin/Productor: Puede subir y borrar archivos.

Staff: Solo consulta.

Formatos clave: PDF (Riders, contratos) y Excel/CSV (Horarios, Listas de personal). Opcional: Imágenes (JPG/PNG) si te da el tiempo para OCR.

Función: Drag & Drop simple donde se etiquete qué es el archivo (ej: "Horarios", "Técnica", "Legales").

B. El Cerebro (Backend + IA)
Base de Datos Vectorial: Guardar la información "embeddeada" (fragmentada y convertida en números) para que la IA la entienda.

Motor RAG (Retrieval-Augmented Generation): Cuando el usuario pregunta, el sistema busca el fragmento relevante en los archivos y se lo pasa al LLM (GPT, Claude, Llama) para que genere la respuesta natural.

C. La Interfaz (El "Output")
El Chatbot: Una ventana de chat simple.

Input: "¿A qué hora toca la banda principal?"

Output: "A las 21:30hs, según el archivo 'Cronograma_V2.xlsx'". (¡Clave que cite la fuente!).

El Dashboard Visual (Estático para MVP):

No intentes graficar todo. Elige UNO para mostrar: Una Línea de Tiempo (Timeline) que se autogenere leyendo los excels de horarios. Eso vende mucho visualmente.

2. Las Problemáticas a Resolver (El Dolor)
Estas son las razones por las que alguien pagaría por tu app. Úsalas en tu pitch:

A. La Fragmentación de la Información (El Caos)
Problema: La data está dispersa en 5 grupos de WhatsApp, 20 hilos de mail y 3 carpetas de Drive. Nadie sabe dónde buscar.

Solución: "Single Source of Truth" (Una única fuente de la verdad). Todo se centraliza en tu base de datos.

B. Latencia en la Respuesta (El Tiempo)
Problema: Un técnico necesita un dato técnico YA. Si tiene que llamar al productor, esperar que este abra la laptop, busque el archivo y responda, pasaron 15 minutos. En un show, 15 minutos es una eternidad.

Solución: Autogestión inmediata. El técnico le pregunta al bot y tiene el dato en 2 segundos.

C. Error Humano por Fatiga
Problema: Después de 14 horas de trabajo, leer un Excel de 500 filas en el celular induce al error. Es fácil confundir la fila 40 con la 41.

Solución: La IA no se cansa y filtra exactamente la fila que necesitas ("Dame el voltaje del escenario B").

D. La "Ceguera" de Datos (Falta de Resumen)
Problema: Tener 50 archivos PDF es tener mucha información pero cero conocimiento. No puedo "ver" el estado general del evento.

Solución: El Dashboard visual transforma archivos muertos en una visualización de estado en tiempo real.


Frontend: React Native + Expo (UI + Suscripción a Realtime).

Backend: NestJS (Lógica de negocio + LangChain para la IA).

Base de Datos / Infra: Supabase (Auth + DB + Storage + Vectores + Realtime).
