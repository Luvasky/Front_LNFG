import { Grid, Box, Typography, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import jsPDF from "jspdf";

function Imprimir() {
  const [cargando, setCargando] = useState(true);
  const location = useLocation();
  const datosBusqueda = location.state;
  const [datos, setDatos] = useState([]);
  const [datosMostrar, setDatosMostrar] = useState([]);

  const datosOrdenes = async () => {
    try {
      const nuevosDatosMostrar = []; // Nuevo array para almacenar datos de cada iteración

      const response = await fetch(
        `http://localhost:3000/apiLNFG/ImprimirOrden/${datosBusqueda.documento}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fecha_examen: datosBusqueda.fecha }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Respuesta exitosa:", data.respuesta);
      setDatos(data.respuesta);

      // Realizar solicitudes para cada elemento en datos
      for (const orden of data.respuesta) {
        const datosPacienteRespuesta = await datosPaciente(orden.id_paciente);
        nuevosDatosMostrar.push({
          ...orden,
          datosPaciente: datosPacienteRespuesta,
        });
      }

      setDatosMostrar(nuevosDatosMostrar);
    } catch (error) {
      console.error("Error de red:", error);
    } finally {
      // Aquí puedes realizar acciones adicionales después de completar todas las solicitudes
      setCargando(false);
    }
  };

  const datosPaciente = async (idPaciente) => {
    try {
      const response = await fetch(
        `http://localhost:3000/apiLNFG/obtenerPacienteDocumento/${idPaciente}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Puedes incluir otras cabeceras según sea necesario
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status}`);
      }

      const data = await response.json();
      console.log("Respuesta Mia", data);
      return data; // Retornar los datos del paciente
    } catch (error) {
      console.error("Error en la solicitud:", error);
      return {}; // Retornar un objeto vacío en caso de error
    }
  };
  const generarPDF = () => {
    const pdf = new jsPDF();
    let yPosition = 20; // Inicializa la posición Y
    let currentPage = 1;

    pdf.text("ORDENES DEL DIA", 20, yPosition);
    datosMostrar.forEach((item, index) => {
      const lineHeight = 10; // Ajusta este valor según tus necesidades

      // Verifica si hay espacio suficiente en la página actual
      if (yPosition + 60 > pdf.internal.pageSize.height) {
        // Cambia a una nueva página
        pdf.addPage();
        yPosition = 20; // Reinicia la posición Y en la nueva página
        currentPage++;
      }

      pdf.setFontSize(8); // Ajusta este valor según tus necesidades
      pdf.text(`Id Orden: ${item.id_orden}`, 130, yPosition + lineHeight - 10);
      const fecha = new Date(item.fecha_examen);
      pdf.text(
        `Fecha: ${fecha.toLocaleDateString()}`,
        20,
        yPosition + lineHeight
      );

      pdf.text(
        `Documento: ${item.datosPaciente.respuesta.documento}`,
        130,
        yPosition + lineHeight
      );
      pdf.text(
        `Paciente: ${item.datosPaciente.respuesta.nombre} ${item.datosPaciente.respuesta.segundo_nombre} ${item.datosPaciente.respuesta.primer_apellido} ${item.datosPaciente.respuesta.segundo_apellido}`,
        20,
        yPosition + 2 * lineHeight
      );
      pdf.text(
        `Valor Factura: ${item.valor_factura}`,
        130,
        yPosition + 2 * lineHeight
      );
      pdf.text(`Examenes: ${item.examenes}`, 20, yPosition + 3 * lineHeight);
      pdf.text(`Paquetes: ${item.paquetes}`, 20, yPosition + 4 * lineHeight);
      pdf.text(
        `Descripcion: ${item.datosPaciente.respuesta.desc_dir}`,
        130,
        yPosition + 4 * lineHeight
      );

      pdf.text(
        `Direccion: ${item.datosPaciente.respuesta.direccion}`,
        130,
        yPosition + 3 * lineHeight
      );

      // Agrega más información según sea necesario

      // Agrega una línea separadora entre cada entrada
      pdf.line(20, yPosition + 5 * lineHeight, 190, yPosition + 5 * lineHeight);

      // Incrementa la posición Y para la próxima entrada
      yPosition += 6 * lineHeight; // Ajusta este valor según tus necesidades
    });

    // Guarda el PDF con el nombre y extensión
    pdf.save(`OrdenesDelDia_Pagina${currentPage}.pdf`);
  };

  useEffect(() => {
    datosOrdenes();
  }, []);
  console.log(datosMostrar);

  return (
    <div>
      <Box>
        <Grid
          xs={10}
          sx={{ display: "flex", justifyContent: "center" }}
          padding={2}
        >
          <Button onClick={generarPDF} variant="contained" color="primary">
            Descargar PDF
          </Button>
        </Grid>
        <Box
          sx={{
            width: "100%",
            textAlign: "center",
            marginTop: "5%",
          }}
        >
          <Typography variant="h5">ORDENES DEL DIA</Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Grid container lg={8} padding={2}>
            {datosMostrar.map((item) => (
              <Grid container key={item.id_orden}>
                <Typography>
                  ******************************************************************************************************************************
                </Typography>
                <Grid
                  padding={2}
                  item
                  lg={6}
                  md={6}
                  sm={6}
                  xs={6}
                  // sx={{ backgroundColor: "red" }}
                >
                  <Box>
                    Fecha: {new Date(item.fecha_examen).toLocaleDateString()}
                  </Box>
                </Grid>

                <Grid
                  padding={2}
                  item
                  lg={6}
                  md={6}
                  sm={6}
                  xs={6}
                  // sx={{ backgroundColor: "blue" }}
                >
                  <Box sx={{ display: "flex", justifyContent: "end" }}>
                    Documento: {item.datosPaciente.respuesta.documento}
                  </Box>
                </Grid>
                <Grid
                  padding={2}
                  item
                  lg={6}
                  md={6}
                  sm={6}
                  xs={6}
                  // sx={{ backgroundColor: "blue" }}
                >
                  <Box>
                    {` Paciente: ${item.datosPaciente.respuesta.nombre} ${item.datosPaciente.respuesta.segundo_nombre} ${item.datosPaciente.respuesta.primer_apellido} ${item.datosPaciente.respuesta.segundo_apellido} `}
                  </Box>
                </Grid>
                <Grid
                  padding={2}
                  item
                  lg={6}
                  md={6}
                  sm={6}
                  xs={6}
                  // sx={{ backgroundColor: "blue" }}
                >
                  <Box sx={{ display: "flex", justifyContent: "end" }}>
                    Valor Factura : $ {item.valor_factura}
                  </Box>
                </Grid>
                <Grid
                  padding={2}
                  item
                  lg={6}
                  md={6}
                  sm={6}
                  xs={6}
                  // sx={{ backgroundColor: "blue" }}
                >
                  <Box>Examenes: {item.examenes}</Box>
                </Grid>

                <Grid
                  padding={2}
                  item
                  lg={6}
                  md={6}
                  sm={6}
                  xs={6}
                  // sx={{ backgroundColor: "blue" }}
                >
                  <Box sx={{ display: "flex", justifyContent: "end" }}>
                    Paquetes: {item.paquetes}
                  </Box>
                </Grid>
                <Grid
                  padding={2}
                  item
                  lg={6}
                  md={6}
                  sm={6}
                  xs={6}
                  // sx={{ backgroundColor: "blue" }}
                >
                  <Box>Direccion: {item.datosPaciente.respuesta.direccion}</Box>
                </Grid>

                <Grid
                  padding={2}
                  item
                  lg={6}
                  md={6}
                  sm={6}
                  xs={6}
                  // sx={{ backgroundColor: "blue" }}
                >
                  <Box sx={{ display: "flex", justifyContent: "end" }}>
                    Descripcion: {item.datosPaciente.respuesta.desc_dir}
                  </Box>
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {cargando && <p>Cargando...</p>}

      {/* Contenido adicional basado en los datos obtenidos */}
    </div>
  );
}

export default Imprimir;