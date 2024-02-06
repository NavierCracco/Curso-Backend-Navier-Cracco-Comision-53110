class TicketManager {
  static #basePriceEarning = 0.15;

  constructor() {
    this.events = [];
  }

  getevents = () => this.events;

  addEvento(name, site, date = new Date(), capacity = 50, cost = 0) {
    // validations
    if (!name || !site) {
      console.log("Fill in name and place");
      return;
    }

    const exist = this.events.find(
      (event) => event.name === name && event.site === site
    );

    if (exist) {
      console.log(`El evento ${name} ya existe..!`);
      return;
    }

    let id = 1;
    if (this.events.length > 0) {
      id = this.events[this.events.length - 1].id + 1;
    }

    let newEvent = {
      id,
      name,
      site,
      date,
      capacity,
      cost: cost + cost * TicketManager.#basePriceEarning,
      asistentes: [],
    };
    this.events.push(newEvent);
  }

  addUser = (id, name, email) => {
    const indexEvent = this.events.findIndex((event) => event.id === id);
    if (indexEvent === -1) {
      console.log(`There are no events with id: ${id}`);
      return;
    }

    const exist = this.events[indexEvent].asistentes.find(
      (asistente) => asistente.email === email
    );
    if (exist) {
      console.log(`The user ${email} is already registered`);
      return;
    }

    this.events[indexEvent].asistentes.push({ name, email });
  };

  putEventOnTour(id, site, date) {
    const indexEvent = this.events.findIndex((event) => event.id === id);
    if (indexEvent === -1) {
      console.log(`There are no events with id: ${id}`);
      return;
    }

    let newId = this.events[this.events.length - 1].id + 1;

    const newEvent = {
      ...this.events[indexEvent],

      id: newId,
      site,
      date,
      asistentes: [],
    };

    this.events.push(newEvent);
  }
}

const tm01 = new TicketManager();

console.log(tm01.getevents());

// events
tm01.addEvento(
  "Festival de musica",
  "Buenos Aires",
  new Date(2024, 1, 12),
  100,
  100
);
tm01.addEvento(
  "Festival de musica 2",
  "Córdoba",
  new Date(2024, 1, 20),
  100,
  100
);
tm01.addEvento(
  "Festival de musica 3",
  "Santa Fe",
  new Date(2024, 1, 29),
  100,
  100
);

// users
tm01.addUser(1, "Juan", "juan@test.com");
tm01.addUser(1, "maria", "maria@test.com");
tm01.addUser(2, "Jose", "jose@test.com");

// events on tour
tm01.putEventOnTour(1, "Salta", new Date(2024, 3, 13), 100, 100);
tm01.putEventOnTour(2, "Rio Negro", new Date(2024, 4, 25), 100, 100);

console.log(JSON.stringify(tm01.getevents(), null, 5));
