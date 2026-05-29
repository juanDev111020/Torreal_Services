# Git Flow — Torreal (2 desarrolladores)

Repositorio: [Torreal_Services](https://github.com/juanDev111020/Torreal_Services)

## Ramas

| Rama | Uso |
|------|-----|
| **`master`** | Código estable / producción. Solo entra lo ya revisado. |
| **`develop`** | Integración. Aquí se fusionan **Dev1** y **Dev2** para probar juntos. |
| **`Dev1`** | Rama de trabajo del desarrollador 1 (otra PC). |
| **`Dev2`** | Rama de trabajo del desarrollador 2 (tu PC). |

```
master  ←── PR (revisión) ←── develop  ←── PR ←── Dev1
                              ↑── PR ←── Dev2
```

## Primera vez en cada PC

```powershell
git clone https://github.com/juanDev111020/Torreal_Services.git
cd Torreal_Services
```

**Desarrollador 1 (otra PC):**

```powershell
git checkout Dev1
git pull origin Dev1
```

**Desarrollador 2 (tu PC):**

```powershell
git checkout Dev2
git pull origin Dev2
```

Luego levantar el proyecto: doble clic en **`Torreal-Iniciar.cmd`** → http://127.0.0.1:4200

---

## Trabajo diario

### 1. Antes de programar (siempre)

Trae los últimos cambios de integración a tu rama:

```powershell
git checkout Dev2          # o Dev1
git fetch origin
git merge origin/develop   # o: git pull origin develop
```

Si hay conflictos, resuélvelos, prueba con Docker y haz commit.

### 2. Hacer cambios

```powershell
git add .
git commit -m "feat: descripción breve del cambio"
git push origin Dev2       # o Dev1
```

### 3. Revisar juntos (Pull Request en GitHub)

1. Entra a https://github.com/juanDev111020/Torreal_Services
2. **Pull requests** → **New pull request**
3. **Base:** `develop` ← **Compare:** `Dev1` (o `Dev2`)
4. Describe qué cambió; el otro revisa el diff en GitHub.
5. Cuando ambos estén de acuerdo → **Merge pull request** en `develop`.
6. En la otra PC: `git checkout Dev1` (o Dev2) y `git pull origin develop` para alinear.

### 4. Pasar a producción (`master`)

Cuando `develop` esté probado y estable:

1. PR: **base `master`** ← **compare `develop`**
2. Revisión final → Merge.
3. Opcional en local: `git checkout master` y `git pull origin master`

---

## Reglas del equipo

- No hacer push directo a **`master`** (solo por PR desde `develop`).
- No trabajar en la misma rama a la vez (uno en **Dev1**, otro en **Dev2**).
- Integrar en **`develop`** antes de ir a **`master`**.
- Mensajes de commit claros: `feat:`, `fix:`, `docs:`, `refactor:`.
- Probar con Docker (`Torreal-Iniciar.cmd`) antes de abrir el PR.

---

## Comandos útiles

```powershell
git branch -a                    # ver ramas
git status
git log --oneline -5
git checkout develop
git pull origin develop
```

## Conflictos al fusionar

```powershell
# Tras git merge origin/develop y ver conflictos:
# 1. Edita los archivos marcados
# 2. git add .
# 3. git commit -m "merge: integrar develop en Dev2"
# 4. git push origin Dev2
```

---

## Resumen por persona

| Persona | Rama | PR hacia |
|---------|------|----------|
| Dev 1 | `Dev1` | `develop` |
| Dev 2 | `Dev2` | `develop` |
| Ambos | `develop` | `master` (cuando esté listo) |
