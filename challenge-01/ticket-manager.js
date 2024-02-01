class TicketManager {
  static #basePriceEarning = 0.15;

  constructor() {
    this.eventos = [];
  }

  getEventos = () => this.eventos;

  addEvento(nombre, lugar, fecha = new Date(), capacidad = 50, costo = 0) {
    // validaciones
    if (!nombre || !lugar) {
      console.log("Fill in name and place");
      return;
    }

    const exist = this.eventos.find(
      (event) => event.nombre === nombre && event.lugar === lugar
    );

    if (exist) {
      console.log(`Event ${nombre} already exists`);
      return;
    }

    let id = 1;
    if (this.eventos.length > 0) {
      id = this.eventos[this.eventos.length - 1].id + 1;
    }

    let newEvent = {
      id,
      nombre,
      lugar,
      fecha,
      capacidad,
      costo: costo + costo * TicketManager.#basePriceEarning,
      asistentes: [],
    };
    this.eventos.push(newEvent);
  }

  addUser = (id, name, email) => {
    const indexEvent = this.eventos.findIndex((event) => event.id === id);
    if (indexEvent === -1) {
      console.log(`no existe `);
    }
  };
}

const tm01 = new TicketManager();

console.log(tm01.getEventos());
tm01.addEvento("Festival de musica", "Bogota", new Date(2024, 1, 12), 100, 100);
tm01.addEvento(
  "Festival de musica 2",
  "Bogota",
  new Date(2024, 1, 12),
  100,
  100
);
tm01.addEvento(
  "Festival de musica 3",
  "Bogota",
  new Date(2024, 1, 12),
  100,
  100
);

console.log(tm01.getEventos());
