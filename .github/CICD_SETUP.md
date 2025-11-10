# Configuración CI/CD - 365-tienda

## Flujos configurados

### 1. PRs de features a develop

- **Archivo**: `.github/workflows/pr-develop.yml`
- **Trigger**: Pull requests hacia `develop` desde ramas `feature/*`
- **Validaciones**:
  - Verifica que la rama feature esté actualizada con develop
  - Ejecuta tests unitarios
  - Realiza build del proyecto
  - Ejecuta análisis de SonarCloud
- **Requisitos**:
  - Las ramas feature deben partir de develop actualizado
  - Requiere aprobación de 1 revisor antes de merge

### 2. Deployment a Demo (Stage)

- **Archivo**: `.github/workflows/deploy-demo.yml`
- **Trigger**: Push a la rama `develop` (después de merge de PR)
- **Proceso**:
  1. Ejecuta tests
  2. Build para ambiente de test (`npm run build:test`)
  3. Análisis de SonarCloud
  4. Deploy automático a Firebase Hosting (demo)
- **URL**: https://test.tienda.365equipo.com

### 3. PRs de release/hotfix a master

- **Archivo**: `.github/workflows/pr-master.yml`
- **Trigger**: Pull requests hacia `master` desde ramas `release/*` o `hotfix/*`
- **Validaciones**:
  - `release/*`: Verifica que parta de develop actualizado
  - `hotfix/*`: Verifica que parta de master actualizado
  - Ejecuta tests unitarios
  - Realiza build para producción
  - Ejecuta análisis de SonarCloud
- **Requisitos**:
  - Requiere aprobación de 1 revisor antes de merge

### 4. Deployment a Producción

- **Archivo**: `.github/workflows/deploy-production.yml`
- **Trigger**: Push a la rama `master` (después de merge de PR)
- **Proceso**:
  1. Ejecuta tests
  2. Build para ambiente de producción (`npm run build:prod`)
  3. Análisis de SonarCloud
  4. Deploy automático a Firebase Hosting (producción)
- **URL**: https://tienda.365equipo.com

## Configuración de Secrets

### Secrets ya configurados

- ✅ `SONAR_TOKEN`: Token de SonarCloud
- ✅ `GITHUB_TOKEN`: Generado automáticamente por GitHub

### Secrets pendientes de configurar

- ⚠️ `GCP_SERVICE_ACCOUNT_KEY`: Service Account de Google Cloud para deployments a Firebase

#### Cómo crear y configurar el Service Account

**Opción recomendada: Service Account (más seguro)**

1. **Crear Service Account en Google Cloud Console**:

   - Ve a https://console.cloud.google.com
   - Selecciona tu proyecto Firebase (silema)
   - Navega a: IAM & Admin > Service Accounts
   - Click en "Create Service Account"
   - Nombre: `github-actions-deploy` (o el que prefieras)
   - Descripción: `Service account para deployments desde GitHub Actions`
   - Click en "Create and Continue"

2. **Asignar permisos necesarios**:

   - Agrega los siguientes roles:
     - `Firebase Hosting Admin` (para deployments)
     - `Service Account User` (si es necesario)
   - Click en "Continue" y luego "Done"

3. **Generar clave JSON**:

   - En la lista de Service Accounts, click en el que acabas de crear
   - Ve a la pestaña "Keys"
   - Click en "Add Key" > "Create new key"
   - Selecciona "JSON"
   - Click en "Create" (se descargará un archivo JSON)

4. **Configurar el secret en GitHub**:

   ```bash
   # Desde la terminal, en el directorio del proyecto
   gh secret set GCP_SERVICE_ACCOUNT_KEY < /ruta/al/archivo-descargado.json
   ```

   O manualmente:

   - Ir a Settings > Secrets and variables > Actions
   - Click en "New repository secret"
   - Name: `GCP_SERVICE_ACCOUNT_KEY`
   - Value: Copia TODO el contenido del archivo JSON (incluyendo las llaves `{}`)
   - Click en "Add secret"

5. **Importante**:
   - ⚠️ Guarda el archivo JSON en un lugar seguro (no lo subas al repositorio)
   - ⚠️ Puedes eliminarlo después de agregarlo como secret en GitHub
   - ✅ Esta clave NO expira a menos que la elimines manualmente
   - ✅ Puedes revocar el acceso en cualquier momento desde Google Cloud Console

**Ventajas del Service Account vs Token CI**:

- ✅ No expira automáticamente
- ✅ Permisos granulares (solo lo necesario)
- ✅ Puede ser revocado sin afectar otras credenciales
- ✅ Mejor trazabilidad y auditoría
- ✅ No está vinculado a un usuario personal

## Protección de ramas

Se ha configurado protección para las siguientes ramas:

### develop

- ✅ Requiere PR para pushear
- ✅ Requiere 1 aprobación
- ✅ Descarta aprobaciones obsoletas
- ✅ Requiere que las conversaciones estén resueltas
- ✅ Requiere estar actualizado con la rama base

### master

- ✅ Requiere PR para pushear
- ✅ Requiere 1 aprobación
- ✅ Descarta aprobaciones obsoletas
- ✅ Requiere que las conversaciones estén resueltas
- ✅ Requiere estar actualizado con la rama base

## Estrategia de branching

```
master (producción)
  ↑
  ├── release/x.x.x (desde develop)
  └── hotfix/descripcion (desde master)

develop (demo/stage)
  ↑
  └── feature/descripcion (desde develop)
```

### Flujo de trabajo

1. **Nueva funcionalidad**:

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/mi-funcionalidad
   # ... desarrollo ...
   git push origin feature/mi-funcionalidad
   # Crear PR a develop
   ```

2. **Release a producción**:

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/2.1.0
   # ... ajustes finales ...
   git push origin release/2.1.0
   # Crear PR a master
   ```

3. **Hotfix urgente**:
   ```bash
   git checkout master
   git pull origin master
   git checkout -b hotfix/fix-critico
   # ... fix ...
   git push origin hotfix/fix-critico
   # Crear PR a master
   # Después del merge, sincronizar con develop
   ```

## SonarCloud

- **Organización**: solucionesit365
- **Proyecto**: solucionesit365_365-tienda
- **Archivo de configuración**: `sonar-project.properties`

El análisis se ejecuta automáticamente en:

- Todos los PRs a develop
- Todos los PRs a master
- Todos los merges a develop y master

## Environments configurados

Los workflows están configurados para usar environments de GitHub:

- `demo`: Deploy a test-tienda
- `production`: Deploy a silema

Puedes configurar protection rules adicionales en:
Settings > Environments > [environment] > Configure environment

## Comandos útiles

```bash
# Ver status de workflows
gh run list

# Ver detalles de un workflow específico
gh run view <run-id>

# Re-ejecutar un workflow fallido
gh run rerun <run-id>

# Ver secrets configurados
gh secret list

# Configurar un nuevo secret
gh secret set SECRET_NAME
```

## Troubleshooting

### Los workflows no se ejecutan

- Verifica que los archivos estén en `.github/workflows/`
- Verifica que la sintaxis YAML sea correcta
- Revisa los permisos de GitHub Actions en Settings > Actions > General

### Fallos en SonarCloud

- Verifica que el token `SONAR_TOKEN` esté configurado
- Verifica la configuración en `sonar-project.properties`
- Verifica que el proyecto exista en SonarCloud

### Fallos en deployment

- Verifica que el secret `GCP_SERVICE_ACCOUNT_KEY` esté configurado correctamente
- Verifica que el Service Account tenga los permisos correctos (Firebase Hosting Admin)
- Verifica que el proyecto de Firebase sea correcto en package.json
- Revisa los logs del workflow para más detalles
- Si el error es de autenticación, regenera la clave del Service Account

## Próximos pasos

1. ⚠️ **Configurar `GCP_SERVICE_ACCOUNT_KEY` secret** (ver instrucciones arriba)
2. Probar el flujo completo:
   - Crear una rama feature y hacer PR a develop
   - Verificar que los checks pasen (tests, build, sonar)
   - Merge y verificar deployment automático a demo
   - Crear una release y hacer PR a master
   - Verificar que los checks pasen
   - Merge y verificar deployment automático a producción
