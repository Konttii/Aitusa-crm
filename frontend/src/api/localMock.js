// Offline / GitHub Pages fallback store so the Telegram Mini App works
// seamlessly both with the local Spring Boot Docker backend and as a standalone GitHub Pages demo.

const STORAGE_KEY = "aitusa.crm.mock.tasks.v1";

const COMMITTEES = [
  { id: 2, name: "Academic", block: 1 },
  { id: 3, name: "CSIA", block: 1 },
  { id: 6, name: "Cultural and Mass Activities", block: 2 },
  { id: 1, name: "Digitalization", block: 1 },
  { id: 7, name: "External Relations", block: 2 },
  { id: 5, name: "Mass Media", block: 2 },
  { id: 4, name: "Social", block: 2 },
];

const USERS = [
  {
    id: "11111111-1111-1111-1111-111111111101",
    telegramId: 100000001,
    email: "kuandyk.akhmetov@astanait.edu.kz",
    first_name: "Куандык",
    last_name: "Ахметов",
    academic_group: "SE-2301",
    group: "SE-2301",
    role: "ADMIN",
    roles: ["admin", "president"],
    memberStatus: "Head",
    committee: "Digitalization",
    committeeId: 1,
    block: 1,
    managedCommitteeIds: [1, 2, 3, 4, 5, 6, 7],
    canCreateTask: true,
    canManageAllTasks: true,
    canDeleteTasks: true,
  },
  {
    id: "11111111-1111-1111-1111-111111111102",
    telegramId: 100000002,
    email: "alikhan.nurlanov@astanait.edu.kz",
    first_name: "Алихан",
    last_name: "Нурланов",
    academic_group: "CS-2304",
    group: "CS-2304",
    role: "HEAD_OF_COMMITTEE",
    roles: ["head"],
    memberStatus: "Head",
    committee: "Digitalization",
    committeeId: 1,
    block: 1,
    managedCommitteeIds: [1],
    canCreateTask: true,
    canManageAllTasks: false,
    canDeleteTasks: false,
  },
  {
    id: "11111111-1111-1111-1111-111111111103",
    telegramId: 100000003,
    email: "aruzhan.sadykova@astanait.edu.kz",
    first_name: "Аружан",
    last_name: "Садыкова",
    academic_group: "IT-2402",
    group: "IT-2402",
    role: "MEMBER",
    roles: ["member"],
    memberStatus: "Member",
    committee: "Digitalization",
    committeeId: 1,
    block: 1,
    managedCommitteeIds: [],
    canCreateTask: false,
    canManageAllTasks: false,
    canDeleteTasks: false,
  },
  {
    id: "11111111-1111-1111-1111-111111111104",
    telegramId: 100000004,
    email: "damir.kassymov@astanait.edu.kz",
    first_name: "Дамир",
    last_name: "Касымов",
    academic_group: "SE-2405",
    group: "SE-2405",
    role: "HEAD_OF_COMMITTEE",
    roles: ["head"],
    memberStatus: "Head",
    committee: "Social",
    committeeId: 4,
    block: 2,
    managedCommitteeIds: [4],
    canCreateTask: true,
    canManageAllTasks: false,
    canDeleteTasks: false,
  },
  {
    id: "11111111-1111-1111-1111-111111111105",
    telegramId: 100000005,
    email: "madina.ospanova@astanait.edu.kz",
    first_name: "Мадина",
    last_name: "Оспанова",
    academic_group: "MT-2302",
    group: "MT-2302",
    role: "MEMBER",
    roles: ["member"],
    memberStatus: "Member",
    committee: "Mass Media",
    committeeId: 5,
    block: 2,
    managedCommitteeIds: [],
    canCreateTask: false,
    canManageAllTasks: false,
    canDeleteTasks: false,
  },
];

function initialTasks() {
  const now = Date.now();
  const day = 24 * 3600 * 1000;
  return [
    {
      id: "22222222-2222-2222-2222-222222222201",
      name: "Миграция CRM бэкенда на Java 21 и Spring Boot 3",
      description: "Перенести модуль управления задачами на Spring Boot 3.3, настроить Spring Data JPA, Flyway миграции и кэширование в Redis.",
      status: "IN_PROGRESS",
      committeeId: 1,
      createdBy: USERS[0].id,
      assignedTo: USERS[2].id,
      assignee: {
        id: USERS[2].id,
        first_name: USERS[2].first_name,
        last_name: USERS[2].last_name,
        email: USERS[2].email,
      },
      completedBy: null,
      deadline: new Date(now + 3 * day).toISOString(),
      createdAt: new Date(now - 4 * day).toISOString(),
      updatedAt: new Date(now - 1 * day).toISOString(),
    },
    {
      id: "22222222-2222-2222-2222-222222222202",
      name: "Интеграция кэширования списков задач в Redis",
      description: "Настроить TTL 5 минут для списков задач и иерархии подчиненных с автоматическим сбросом кэша при изменении статуса или исполнителя.",
      status: "ASSIGNED",
      committeeId: 1,
      createdBy: USERS[1].id,
      assignedTo: USERS[1].id,
      assignee: {
        id: USERS[1].id,
        first_name: USERS[1].first_name,
        last_name: USERS[1].last_name,
        email: USERS[1].email,
      },
      completedBy: null,
      deadline: new Date(now + 5 * day).toISOString(),
      createdAt: new Date(now - 3 * day).toISOString(),
      updatedAt: new Date(now - 2 * day).toISOString(),
    },
    {
      id: "22222222-2222-2222-2222-222222222203",
      name: "Разработка Telegram Mini App деплоя на GitHub Pages",
      description: "Подготовить пайплайн автоматической сборки фронтенда и публикации статического Mini App на GitHub Pages с демо-режимом.",
      status: "PUBLISHED",
      committeeId: 1,
      createdBy: USERS[0].id,
      assignedTo: null,
      assignee: null,
      completedBy: null,
      deadline: new Date(now + 4 * day).toISOString(),
      createdAt: new Date(now - 2 * day).toISOString(),
      updatedAt: new Date(now - 12 * 3600 * 1000).toISOString(),
    },
    {
      id: "22222222-2222-2222-2222-222222222204",
      name: "Анонс набора стажёров в комитеты AITUSA",
      description: "Подготовить афиши, пост для Telegram-канала и расписание собеседований для осеннего набора стажёров.",
      status: "CREATED",
      committeeId: 5,
      createdBy: USERS[0].id,
      assignedTo: null,
      assignee: null,
      completedBy: null,
      deadline: new Date(now + 6 * day).toISOString(),
      createdAt: new Date(now - 2 * day).toISOString(),
      updatedAt: new Date(now - 6 * 3600 * 1000).toISOString(),
    },
    {
      id: "22222222-2222-2222-2222-222222222205",
      name: "Организация благотворительной ярмарки AITU Charity",
      description: "Согласовать дату проведения в атриуме университета, распределить точки комитетов и подготовить форму волонтёров.",
      status: "COMPLETED",
      committeeId: 4,
      createdBy: USERS[3].id,
      assignedTo: USERS[3].id,
      assignee: {
        id: USERS[3].id,
        first_name: USERS[3].first_name,
        last_name: USERS[3].last_name,
        email: USERS[3].email,
      },
      completedBy: USERS[3].id,
      deadline: new Date(now - 1 * day).toISOString(),
      createdAt: new Date(now - 7 * day).toISOString(),
      updatedAt: new Date(now - 1 * day).toISOString(),
    },
  ];
}

function loadTasks() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Fallback to in-memory seed
  }
  const seeded = initialTasks();
  saveTasks(seeded);
  return seeded;
}

function saveTasks(tasks) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Ignore storage limits
  }
}

function resolveActor(initData) {
  if (initData && initData.startsWith("demo:")) {
    const tgId = Number(initData.slice(5));
    const found = USERS.find((u) => u.telegramId === tgId);
    if (found) return found;
  }
  return USERS[0];
}

export function handleLocalRequest(path, { method = "GET", body, params } = {}, initData = "") {
  const actor = resolveActor(initData);
  const tasks = loadTasks();

  if (path === "/auth/me" && method === "GET") {
    return { ...actor };
  }

  if (path === "/task-committees" && method === "GET") {
    return COMMITTEES.filter((c) => actor.managedCommitteeIds.includes(c.id)).map(({ id, name }) => ({ id, name }));
  }

  if (path === "/users/subordinates" && method === "GET") {
    if (!actor.canCreateTask) return [];
    const search = (params?.search || "").trim().toLowerCase();
    const committeeId = params?.committeeId ? Number(params.committeeId) : null;
    const includeSelf = Boolean(params?.includeSelf);

    return USERS.filter((u) => actor.managedCommitteeIds.includes(u.committeeId))
      .filter((u) => includeSelf || u.id !== actor.id)
      .filter((u) => !committeeId || u.committeeId === committeeId)
      .filter((u) => {
        if (!search) return true;
        const full = `${u.first_name} ${u.last_name}`.toLowerCase();
        return (
          full.includes(search) ||
          u.email.toLowerCase().includes(search) ||
          u.academic_group.toLowerCase().includes(search)
        );
      });
  }

  if (path === "/tasks" && method === "GET") {
    const page = Number(params?.page || 0);
    const size = Number(params?.size || 10);
    const status = params?.status;
    const assignedTo = params?.assignedTo;
    const unassigned = params?.unassigned;

    let visible = tasks.filter((t) => {
      if (actor.canManageAllTasks) return true;
      if (actor.managedCommitteeIds.includes(t.committeeId)) return true;
      if (t.assignedTo === actor.id) return true;
      if (!t.assignedTo && (t.status === "CREATED" || t.status === "PUBLISHED") && (!t.committeeId || t.committeeId === actor.committeeId)) {
        return true;
      }
      return false;
    });

    if (unassigned === true || unassigned === "true") {
      visible = visible.filter((t) => !t.assignedTo);
    } else if (unassigned === false || unassigned === "false") {
      visible = visible.filter((t) => Boolean(t.assignedTo));
    }
    if (assignedTo) {
      visible = visible.filter((t) => String(t.assignedTo) === String(assignedTo));
    }
    if (status) {
      visible = visible.filter((t) => t.status === status);
    }

    visible.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const totalElements = visible.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / size));
    const content = visible.slice(page * size, (page + 1) * size);
    return { content, page, size, totalElements, totalPages };
  }

  if (path === "/tasks" && method === "POST") {
    const assigneeUser = body?.assignedTo ? USERS.find((u) => u.id === body.assignedTo) : null;
    const nowIso = new Date().toISOString();
    const created = {
      id: crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}`,
      name: (body?.name || "").trim(),
      description: body?.description || null,
      status: assigneeUser ? "ASSIGNED" : "CREATED",
      committeeId: body?.committeeId || assigneeUser?.committeeId || actor.committeeId || 1,
      createdBy: actor.id,
      assignedTo: assigneeUser ? assigneeUser.id : null,
      assignee: assigneeUser
        ? {
            id: assigneeUser.id,
            first_name: assigneeUser.first_name,
            last_name: assigneeUser.last_name,
            email: assigneeUser.email,
          }
        : null,
      completedBy: null,
      deadline: body?.deadline || null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    tasks.unshift(created);
    saveTasks(tasks);
    return created;
  }

  const takeMatch = path.match(/^\/tasks\/([^/]+)\/take$/);
  if (takeMatch && method === "POST") {
    const taskId = takeMatch[1];
    const task = tasks.find((t) => t.id === taskId);
    if (!task) throw new Error("Задача не найдена");
    task.assignedTo = actor.id;
    task.assignee = {
      id: actor.id,
      first_name: actor.first_name,
      last_name: actor.last_name,
      email: actor.email,
    };
    task.status = "ASSIGNED";
    task.updatedAt = new Date().toISOString();
    saveTasks(tasks);
    return { ...task };
  }

  const statusMatch = path.match(/^\/tasks\/([^/]+)\/status$/);
  if (statusMatch && method === "PATCH") {
    const taskId = statusMatch[1];
    const task = tasks.find((t) => t.id === taskId);
    if (!task) throw new Error("Задача не найдена");
    task.status = body.status;
    task.completedBy = body.status === "COMPLETED" ? actor.id : null;
    task.updatedAt = new Date().toISOString();
    saveTasks(tasks);
    return { ...task };
  }

  const itemMatch = path.match(/^\/tasks\/([^/]+)$/);
  if (itemMatch) {
    const taskId = itemMatch[1];
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) throw new Error("Задача не найдена");

    if (method === "GET") {
      return { ...tasks[idx] };
    }
    if (method === "PATCH") {
      const task = tasks[idx];
      if (body.name !== undefined) task.name = body.name.trim();
      if (body.description !== undefined) task.description = body.description;
      if (body.deadline !== undefined) task.deadline = body.deadline;
      if ("assignedTo" in body && body.assignedTo !== task.assignedTo) {
        const assigneeUser = body.assignedTo ? USERS.find((u) => u.id === body.assignedTo) : null;
        task.assignedTo = assigneeUser ? assigneeUser.id : null;
        task.assignee = assigneeUser
          ? {
              id: assigneeUser.id,
              first_name: assigneeUser.first_name,
              last_name: assigneeUser.last_name,
              email: assigneeUser.email,
            }
          : null;
        if (assigneeUser) task.committeeId = assigneeUser.committeeId;
        task.status = assigneeUser ? "ASSIGNED" : "CREATED";
        task.completedBy = null;
      }
      task.updatedAt = new Date().toISOString();
      saveTasks(tasks);
      return { ...task };
    }
    if (method === "DELETE") {
      tasks.splice(idx, 1);
      saveTasks(tasks);
      return null;
    }
  }

  throw new Error("Маршрут не найден");
}
