"use client";
import withAuth from "@/auth/withAuth";
import Header from "@/components/header/Header";
import Movil from "@/components/header/Movil";
import { useProduct } from "@/provider/ProviderContext";
import { useMediaQuery } from "@mantine/hooks";
import React, { useEffect, useState } from "react";
import { Button, Select } from "@mantine/core";
import dataApi from "@/data/fetchData";
import { useRouter, useSearchParams } from "next/navigation";
import "@mantine/dates/styles.css";
import { notifications } from "@mantine/notifications";
import Username from "@/components/username/Username";
import Calendary from "@/components/pruebatesteo/Calendary/Calendary";
import LodingFile from "@/components/loading/LodingFile";

const Page = () => {
  const { user } = useProduct();
  const [memoryTime, setMemoryTime] = useState([]);
  const [dataTime, setDataTime] = useState([]);
  const [dataSuperName, setDataSuperName] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [idSuper, setIdSuper] = useState(null);
  const [idTime, setIdTime] = useState(null);
  const [disable, setDisable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [timeInitial, setTimeInitial] = useState(false);
  const [update, setUpdate] = useState(false);
  const matches = useMediaQuery("(min-width: 1099px)");
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  useEffect(() => {
    const getAdmi = async () => {
      const validCitaFetch = await dataApi.getValidCita(user.token, id);
      setTimeInitial(validCitaFetch?.processStatus?.updatedAt);

      try {
        const resSuper = await dataApi.getSuperUser(user.token, id);
        const resHorario = await dataApi.getTimeCita(user.token);
        let nameSuperArray = [];
        let horarioArray = [];

        resSuper.forEach((adm) => {
          nameSuperArray.push({
            value: adm.user.id,
            label: `${adm.user.firstName} ${adm.user.apellido_paterno} ${adm.user.apellido_materno}`,
          });
        });
        resHorario.forEach((time) => {
          horarioArray.push({
            value: time.id,
            label: `${time.startTime} ${time.endTime}`,
          });
        });

        setDataSuperName(nameSuperArray);
        setDataTime(horarioArray);
        setMemoryTime(horarioArray);
      } finally {
        setLoading(false);
      }
    };

    getAdmi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  useEffect(() => {
    const timeAvilid = async () => {
      setDisable(true);

      if (idSuper && selectedDate) {
        const getTimes = await dataApi.getSuperTime(
          user.token,
          idSuper,
          selectedDate
        );

        // Obtener todos los IDs de horarios
        const idsToDisable = getTimes.map((item) => item.schedule.id);

        // Actualizar el estado de dataTime usando el estado anterior
        const newDataTime = memoryTime.map((item) => ({
          ...item,
          disabled: idsToDisable.includes(item.value)
            ? true
            : item.disabled || false,
        }));
        setDisable(false);
        setDataTime(newDataTime);

        // setSelectedDate(null);
      }
    };

    timeAvilid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idSuper, selectedDate,update]);

  const handleCreateCita = async () => {
    if (idTime && idSuper && selectedDate) {
      setLoading(true)
      notifications.show({
        id: id,
        withCloseButton: true,
        autoClose: false,
        title: "Creando cita espere...",
        message: "",
        color: "green",
        // icon: <FaFilePdf />,
        className: "my-notification-class",
        loading: true,
      });
    }

    const res = await dataApi.getCreateCita(
      user.token,
      id,
      idTime,
      idSuper,
      selectedDate
    );
   
    //todo valida si ya tiene cita de verdad
    const verifyCita = await dataApi.verifyCita(user.token, id);
    if(res.error){
      notifications.update({
        id: id,
        withCloseButton: true,
        autoClose: 3000,
        title: res.message,
        message: "",
        color: "red",
        // icon: <FaFilePdf />,
        className: "my-notification-class",
        loading: false,
      });
      setUpdate(!update)
      router.refresh();
      return
    }
    if (res.status === "PENDING") {
      setLoading(false)
      notifications.update({
        id: id,
        withCloseButton: true,
        autoClose: 3000,
        title: "Cita creada exitosa",
        message: "",
        color: "green",
        // icon: <FaFilePdf />,
        className: "my-notification-class",
        loading: false,
      });
      window.open(`/confirmacion-de-cita?id=${id}`, "_blank");
      router.back();
    }
    if (res.ok) {
      setLoading(false)
      notifications.update({
        id: id,
        withCloseButton: true,
        autoClose: 3000,
        title: "Usted ya tiene una cita pediente",
        message: "",
        color: "red",
        // icon: <FaFilePdf />,
        className: "my-notification-class",
        loading: false,
      });
    }
  };

  const handleAdmi = (value) => {
    setIdSuper(value);
    setIdTime(null);
  };

  return (
    <>
      <div className="body-grid">
        {!matches && <Movil />}
        {matches && <Header />}
        <main className="bg-white">
          {matches && (
            <Username
              firstName={user.firstName}
              paterno={user.apellido_paterno}
              materno={user.apellido_materno}
            />
          )}
          <div className="px-10 py-4 relative">
            {loading && <LodingFile/>}
            <h1 className="text-3xl font-bold uppercase">Reserve su cita</h1>
            <p>Solo puede seleccionar los días sábados.</p>
            <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-2 mt-4">
              <div className="">
                <div className="flex gap-3 mb-4 ">
                  <Select
                    label="Seleccione la persona que lo atenderá"
                    placeholder="ejemplo: Raúl Gonzales"
                    data={dataSuperName}
                    onChange={(value) => handleAdmi(value)}
                  />

                  <Select
                    label="Seleccione primero una fecha"
                    placeholder="Click aquí elige horario"
                    data={dataTime}
                    value={idTime}
                    onChange={setIdTime}
                    disabled={disable}
                  />
                </div>
                <Calendary
                  initialDate={timeInitial}
                  setIdTime={setIdTime}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />
                <div className="mt-3">
                  <Button
                    variant="filled"
                    color="green"
                    onClick={handleCreateCita}
                  >
                    SOLICITAR CITA
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default withAuth(Page, "user");
