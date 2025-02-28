import Swal, { SweetAlertIcon } from "sweetalert2";

/**
 * Configuración de alerta personalizada con SweetAlert2
 * Permite múltiples configuraciones y personalizaciones
 */
export const showAlert = ({
  type = "info" as SweetAlertIcon,
  title = "Información",
  text = "",
  showConfirm = true,
  confirmText = "Aceptar",
  onConfirm,
  cancelText,
  showCancel = false,
  denyText,
  showDeny = false,
  onDeny,
  width = '400px',
  padding = '1rem',
  customClass,
  timer,
}: {
  type?: SweetAlertIcon;
  title?: string;
  text?: string;
  showConfirm?: boolean;
  confirmText?: string;
  onConfirm?: () => void;
  cancelText?: string;
  showCancel?: boolean;
  addText?: string;
  showAdd?: boolean;
  denyText?: string;
  showDeny?: boolean;
  onDeny?: () => void;
  width?: string;
  padding?: string;
  customClass?: string;
  timer?: number;
}) => {
  Swal.fire({
    icon: type,
    title: title,
    text: text,
    width: width,
    padding: padding,
    customClass: {
      popup: customClass || '',
    },
    timer: timer,
    timerProgressBar: !!timer,
    showConfirmButton: showConfirm,
    confirmButtonText: confirmText,
    confirmButtonColor: "#02a90d", 
    showCancelButton: showCancel,
    cancelButtonText: cancelText || "Cancelar",
    cancelButtonColor: "#6487f4", 
    showDenyButton: showDeny, 
    denyButtonText: denyText || "Otra opción",
    denyButtonColor: "#fe4646",
  }).then((result) => {
    if (result.isConfirmed && typeof onConfirm === "function") {
      onConfirm();
    } else if (result.isDenied && typeof onDeny === "function") {
      onDeny();
    }
  });
};

/**
 * Muestra una alerta con múltiples opciones de acción personalizadas.
 * @param title Título de la alerta
 * @param text Texto descriptivo de la alerta
 * @param options Arreglo de opciones con texto y acción
 */
export const showSelectionAlert = (
  title: string,
  text: string,
  options: { text: string; action: () => void }[]
) => {
  Swal.fire({
    title,
    text,
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    cancelButtonColor: "#f24c4c",
    showConfirmButton: false,
    html: options
      .map(
        (option, index) =>
          `<button class="swal2-confirm swal2-styled swal2-button${index}" style="margin: 5px;">${option.text}</button>`
      )
      .join(""),
    didOpen: () => {
      options.forEach((option, index) => {
        const button = document.querySelector(`.swal2-button${index}`);
        if (button) {
          button.addEventListener("click", () => {
            Swal.close();
            option.action();
          });
        }
      });
    },
  });
};

/**
 * Muestra una alerta de éxito
 * @param title Título de la alerta
 * @param text Mensaje de éxito
 * @param onConfirm Callback opcional al confirmar
 */
export const showSuccess = (
  title: string, 
  text: string, 
  onConfirm?: () => void
) => {
  showAlert({ 
    type: "success", 
    title, 
    text, 
    onConfirm,
    timer: 3000 // Auto-cierra en 3 segundos
  });
};

/**
 * Muestra una alerta de error
 * @param title Título del error
 * @param text Mensaje de error
 * @param onConfirm Callback opcional al confirmar
 */
export const showError = (
  title: string, 
  text: string, 
  onConfirm?: () => void
) => {
  showAlert({
    type: "error",
    title,
    text,
    onConfirm,
    cancelText: "Cerrar",
    showCancel: true,
    width: '450px'
  });
};

/**
 * Muestra una alerta de advertencia
 * @param title Título de la advertencia
 * @param text Mensaje de advertencia
 * @param onConfirm Callback opcional al confirmar
 */
export const showWarning = (
  title: string, 
  text: string, 
  onConfirm?: () => void
) => {
  showAlert({ 
    type: "warning", 
    title, 
    text, 
    onConfirm 
  });
};

/**
 * Muestra una alerta de confirmación con dos botones
 * @param title Título de la confirmación
 * @param text Mensaje de confirmación
 * @param onConfirm Callback al confirmar
 * @param confirmText Texto personalizado para botón de confirmación
 */
export const showConfirm = (
  title: string,
  text: string,
  onConfirm: () => void,
  confirmText: string = "Confirmar",
  type: SweetAlertIcon = "question" 
) => {
  showAlert({
    type, 
    title,
    text,
    onConfirm,
    confirmText,
    cancelText: "Cancelar",
    showCancel: true,
    width: "450px",
  });
};


/**
 * Muestra una alerta con opción adicional
 * @param title Título de la alerta
 * @param text Mensaje de la alerta
 * @param onConfirm Callback al confirmar
 * @param addText Texto personalizado para botón adicional
 */
export const showAddOption = (
  title: string,
  text: string,
  onConfirm: () => void,
  addText: string = "Agregar"
) => {
  showAlert({
    type: "info",
    title,
    text,
    onConfirm,
    addText,
    showAdd: true,
    width: '450px'
  });
};