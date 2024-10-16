import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import React from "react";
import { FaFilePdf } from "react-icons/fa6";

const ButtonUpdateFile = ({ matchingFile, fileName, idFiles, getfileName,sectionIdDocument }) => {
  const url = "https://xynydxu4qi.us-east-2.awsapprunner.com/api/files/pdf";

  const handleConverPostPdf = async (typeId, namePdf, idFileInput) => {
    setLoadingFile(true);
    if (files[namePdf].length === 0) return;

    const idFile = notifications.show({
      withCloseButton: true,
      autoClose: false,
      title: "Espere subiendo archivo",
      message: namePdf,
      color: "red",
      icon: <FaFilePdf />,
      className: "my-notification-class",
      loading: true,
    });

    const mergedPdf = await PDFDocument.create();

    for (const file of files[namePdf]) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const pdfBytes = await mergedPdf.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const fileConvert = new File([blob], `${namePdf}.pdf` || "merged.pdf", {
      type: "application/pdf",
    });

    if (fileConvert.type === "application/pdf" && validatePdf(fileConvert)) {
      try {
        const res = await dataApi.postFileOne(
          user.token,
          fileConvert,
          typeId,
          "",
          idFileInput
        );

        setFilePdf(res.fileUrl);

        if (res.fileUrl) {
          setEstadoOk({ ...stateOk, [namePdf]: true });
          notifications.update({
            id: idFile,
            withCloseButton: true,
            autoClose: 3000,
            title: "Archivo PDF subido",
            message: namePdf,
            color: "black",
            icon: <FaFilePdf />,
            className: "my-notification-class",
            style: { backgroundColor: "greenyellow" },
            loading: false,
          });
          const res = await dataApi.getFilesUser(idDocument, user.token);
        }
        return;
      } finally {
        setLoadingFile(false);
      }
    }

    if (!validatePdf(fileConvert)) {
      setLoadingFile(false);
      notifications.update({
        id: idFile,
        withCloseButton: true,
        autoClose: 3000,
        title: "Archivo demasiado pesado",
        message: "pdf debe ser menos de 10MB",
        color: "red",
        icon: <FaFilePdf />,
        className: "my-notification-class",
        loading: false,
      });
    }
  };

  return (
    <div className="flex gap-2 self-start lg:self-end  md:self-end sm:self-end ">
      {matchingFile && (
        <Link
          className={"self-end"}
          target="_blank"
          href={`${url}/${matchingFile.fileUrl}`}
        >
          <Button
            variant="gradient"
            gradient={{ from: "pink", to: "red", deg: 90 }}
          >
            <FaFilePdf />
          </Button>
        </Link>
      )}

      {matchingFile && (
        <Button
          className="self-end"
          variant="gradient"
          gradient={{ from: "lime", to: "green", deg: 90 }}
        >
          EXITOSO
        </Button>
      )}
      {!matchingFile && (
        <Button
          className="self-end"
          disabled={fileName === undefined || !fileName.length ? true : false}
          onClick={() =>
            handleConverPostPdf(sectionIdDocument, getfileName, idFiles)
          }
          variant="gradient"
          gradient={{ from: "blue", to: "violet", deg: 90 }}
        >
          ENVIAR DOCUMENTO
        </Button>
      )}
    </div>
  );
};


export default ButtonUpdateFile;