import { NextResponse } from "next/server";

let projects = global.projects || [];
global.projects = projects;

export async function GET(req, { params }) {
    const project = projects.find(p => p.id === parseInt(params.id));
    return project
        ? NextResponse.json(project)
        : NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
}

export async function PUT(req, { params }) {
    const projectIndex = projects.findIndex(p => p.id === parseInt(params.id));
    if (projectIndex === -1) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const { nombre, descripcion, fechaLimite, colaboradores } = await req.json();
    const updated = { ...projects[projectIndex], nombre, descripcion, fechaLimite, colaboradores };
    projects[projectIndex] = updated;

    return NextResponse.json(updated);
}

export async function DELETE(req, { params }) {
    projects = projects.filter(p => p.id !== parseInt(params.id));
    global.projects = projects;
    return NextResponse.json({ message: "Proyecto eliminado" });
}
