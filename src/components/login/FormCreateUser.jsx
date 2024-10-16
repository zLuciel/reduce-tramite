import React, { useState } from "react";
import { MdOutgoingMail } from "react-icons/md";
import {
  Button,
  Group,
  InputBase,
  PasswordInput,
  TextInput,
} from "@mantine/core";
import { LiaDigitalTachographSolid } from "react-icons/lia";
import { FaUserEdit, FaMapMarkerAlt } from "react-icons/fa";
import { FaPhone } from "react-icons/fa6";
import { TbPasswordFingerprint } from "react-icons/tb";
import { IMaskInput } from "react-imask";
import "@mantine/dates/styles.css";
import { notifications } from "@mantine/notifications";
import "dayjs/locale/es";
import dataApi from "@/data/fetchData";


const FormCreateUser = ({ registreForm, setView }) => {

  const [emailVerify, setEmailVerify] = useState(false);

  const registreApi = async (data) => {
    notifications.show({
      id: 15,
      withCloseButton: true,
      autoClose: false,
      title: `Enviando datos al registro`,
      message: "esperando...",
      color: "green",
      className: "",
      loading: true,
    });

    try {
      const json = await dataApi.CreateUserLogin(data);

      if (json.error) {
        notifications.update({
          id: 15,
          withCloseButton: true,
          autoClose: 3000,
          title: json.message,
          message: "",
          color: "red",
          className: "",
          loading: false,
        });
      }
      if (json.roles[0] == "user") {
        notifications.update({
          id: 15,
          withCloseButton: true,
          autoClose: 3000,
          title: `${json.firstName} ${json.apellido_paterno} ${json.apellido_materno}`,
          message: "Gracias por registrarte",
          color: "green",
          className: "",
          loading: false,
        });
        if (!json?.isVerified) setEmailVerify(true);

        return;
      }
      if (!json.ok) {
        notifications.update({
          id: 15,
          withCloseButton: true,
          autoClose: 3000,
          title: "Algo salio mal",
          message: "revise su conexion a internet",
          color: "red",
          className: "",
          loading: false,
        });
      }
    } catch (error) {}
  };


  return (
    <form
      className=""
      onSubmit={registreForm.onSubmit((values) => registreApi(values))}
    >
      <div className="grid grid-cols-2 gap-x-10 gap-y-3">
        <InputBase
          withAsterisk
          label="DNI"
          component={IMaskInput}
          mask="00000000"
          placeholder="Ingrese su dni"
          leftSection={
            <LiaDigitalTachographSolid
              className="flex justify-center items-center"
              size={16}
            />
          }
          key={registreForm.key("dni")}
          {...registreForm.getInputProps("dni")}
        />

        <TextInput
          withAsterisk
          label="NOMBRES"
          placeholder="Ingrese su nombre"
          leftSection={
            <FaUserEdit
              className="flex justify-center items-center"
              size={16}
            />
          }
          key={registreForm.key("firstName")}
          {...registreForm.getInputProps("firstName")}
        />
        <TextInput
          withAsterisk
          label="APELLIDO PATERNO"
          placeholder="Ingrese su apellido paterno"
          leftSection={
            <FaUserEdit
              className="flex justify-center items-center"
              size={16}
            />
          }
          key={registreForm.key("apellido_paterno")}
          {...registreForm.getInputProps("apellido_paterno")}
        />
        <TextInput
          withAsterisk
          label="APELLIDO MATERNO"
          placeholder="Ingrese su apellido materno"
          leftSection={
            <FaUserEdit
              className="flex justify-center items-center"
              size={16}
            />
          }
          key={registreForm.key("apellido_materno")}
          {...registreForm.getInputProps("apellido_materno")}
        />

        <TextInput
          withAsterisk
          label="CORREO"
          placeholder="ejemplo@gmail.com"
          leftSection={
            <MdOutgoingMail
              className="flex justify-center items-center"
              size={16}
            />
          }
          key={registreForm.key("email")}
          {...registreForm.getInputProps("email")}
        />
        <TextInput
          withAsterisk
          label="DIRECCIÓN"
          placeholder="Ejemplo: jr sol de oro 7028"
          leftSection={
            <FaMapMarkerAlt
              className="flex justify-center items-center"
              size={16}
            />
          }
          key={registreForm.key("address")}
          {...registreForm.getInputProps("address")}
        />
        <TextInput
          withAsterisk
          label="DISTRITO"
          leftSection={
            <FaMapMarkerAlt
              className="flex justify-center items-center"
              size={16}
            />
          }
          placeholder="ejemplo: Los olivos"
          key={registreForm.key("district")}
          {...registreForm.getInputProps("district")}
        />
        <InputBase
          withAsterisk
          label="TELÉFONO"
          component={IMaskInput}
          mask="000000000"
          placeholder="ejemplo: 999 999 999"
          leftSection={
            <FaPhone className="flex justify-center items-center" size={16} />
          }
          key={registreForm.key("mobileNumber")}
          {...registreForm.getInputProps("mobileNumber")}
        />

        <div className="col-span-2">
          <PasswordInput
            fullWidth
            label="CONTRASEÑA"
            placeholder="Ingrese su contraseña"
            leftSection={
              <TbPasswordFingerprint
                className="flex justify-center items-center"
                size={16}
              />
            }
            key={registreForm.key("password")}
            {...registreForm.getInputProps("password")}
          />
        </div>
      </div>
      <Group className="w-full" mt="md">
        {emailVerify && (
          <div className="font-semibold rounded-md login-email-very p-3 text-center w-full">
            Por favor, verifica tu correo electrónico antes de iniciar sesión.
          </div>
        )}
        <Button type="submit" fullWidth>
          Enviar
        </Button>
      </Group>
    </form>
  );
};

export default FormCreateUser;
