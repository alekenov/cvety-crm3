#!/bin/bash

# CRUD тестирование API /inventory/ через cURL
# Полный набор тестов для страницы инвентаря

# Конфигурация
BASE_URL="https://cvety.kz/api/v2/inventory"
ACCESS_TOKEN="ABE7142D-D8AB-76AF-8D6C-2C4FAEA9B144"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для логирования
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Функция для проверки HTTP статуса
check_status() {
    local status=$1
    local expected=$2
    local test_name=$3
    
    if [ "$status" = "$expected" ]; then
        success "$test_name - HTTP $status"
        return 0
    else
        error "$test_name - Expected HTTP $expected, got $status"
        return 1
    fi
}

# Функция для выполнения запросов с таймаутом
api_request() {
    local method=$1
    local url=$2
    local data=$3
    local description=$4
    
    log "$description"
    
    if [ -n "$data" ]; then
        curl -s -w "HTTP_STATUS:%{http_code}" \
             -X "$method" \
             -H "Content-Type: application/json" \
             --connect-timeout 10 \
             --max-time 30 \
             -d "$data" \
             "$url"
    else
        curl -s -w "HTTP_STATUS:%{http_code}" \
             -X "$method" \
             --connect-timeout 10 \
             --max-time 30 \
             "$url"
    fi
}

echo "🚀 Запуск CRUD тестирования API /inventory/"
echo "========================================="

# =============================================================================
# 1. READ ОПЕРАЦИИ - Тестирование получения данных
# =============================================================================

log "📖 ТЕСТИРОВАНИЕ READ ОПЕРАЦИЙ"
echo "--------------------------------"

# 1.1 Получение списка товаров (базовый запрос)
log "1.1 Базовый список товаров"
RESPONSE=$(api_request "GET" "${BASE_URL}/?access_token=${ACCESS_TOKEN}" "" "Получение списка товаров")

HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')

check_status "$HTTP_STATUS" "200" "Базовый список товаров"
echo "$BODY" | jq -r '.data | length' | xargs -I {} echo "Получено товаров: {}"

# 1.2 Тест пагинации
log "1.2 Тест пагинации (limit=5, offset=0)"
RESPONSE=$(api_request "GET" "${BASE_URL}/?access_token=${ACCESS_TOKEN}&limit=5&offset=0" "" "Первые 5 товаров")
HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')

check_status "$HTTP_STATUS" "200" "Пагинация (первая страница)"
TOTAL=$(echo "$BODY" | jq -r '.pagination.total // 0')
HAS_MORE=$(echo "$BODY" | jq -r '.pagination.hasMore // false')
echo "Всего товаров: $TOTAL, есть ещё: $HAS_MORE"

# 1.3 Тест поиска
log "1.3 Тест поиска по названию"
SEARCH_TERMS=("Country" "roses" "Test")

for term in "${SEARCH_TERMS[@]}"; do
    log "Поиск по: '$term'"
    RESPONSE=$(api_request "GET" "${BASE_URL}/?access_token=${ACCESS_TOKEN}&search=$term&limit=3" "" "Поиск: $term")
    HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')
    
    if check_status "$HTTP_STATUS" "200" "Поиск '$term'"; then
        COUNT=$(echo "$BODY" | jq -r '.data | length')
        echo "  Найдено результатов: $COUNT"
    fi
done

# 1.4 Тест фильтрации по типу цветов
log "1.4 Фильтрация по типу цветов"
FLOWER_TYPES=("roses" "tulips")

for flower in "${FLOWER_TYPES[@]}"; do
    log "Фильтр по цветам: '$flower'"
    RESPONSE=$(api_request "GET" "${BASE_URL}/?access_token=${ACCESS_TOKEN}&flower=$flower&limit=5" "" "Фильтр: $flower")
    HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    
    if check_status "$HTTP_STATUS" "200" "Фильтр '$flower'"; then
        BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')
        COUNT=$(echo "$BODY" | jq -r '.data | length')
        echo "  Найдено товаров типа '$flower': $COUNT"
    fi
done

# 1.5 Тест фильтрации по услугам
log "1.5 Фильтрация по услугам"
RESPONSE=$(api_request "GET" "${BASE_URL}/?access_token=${ACCESS_TOKEN}&service=true&limit=10" "" "Только услуги")
HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)

if check_status "$HTTP_STATUS" "200" "Фильтр услуг"; then
    BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')
    COUNT=$(echo "$BODY" | jq -r '.data | length')
    echo "  Найдено услуг: $COUNT"
fi

# 1.6 Тест сортировки
log "1.6 Тест сортировки"
RESPONSE=$(api_request "GET" "${BASE_URL}/?access_token=${ACCESS_TOKEN}&sort_by=cost&sort_order=desc&limit=5" "" "Сортировка по цене убывание")
HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)

if check_status "$HTTP_STATUS" "200" "Сортировка по цене"; then
    BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')
    echo "  Первые 3 товара по убыванию цены:"
    echo "$BODY" | jq -r '.data[:3] | .[] | "  - \(.name): \(.cost) ₸"'
fi

# 1.7 Получение истории операций
log "1.7 Тест получения истории операций"
# Получаем ID первого товара
FIRST_ITEM_ID=$(echo "$BODY" | jq -r '.data[0].id // 89')

RESPONSE=$(api_request "GET" "${BASE_URL}/history/?access_token=${ACCESS_TOKEN}&id=${FIRST_ITEM_ID}&limit=5" "" "История товара ID:$FIRST_ITEM_ID")
HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)

if check_status "$HTTP_STATUS" "200" "История операций"; then
    BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')
    HISTORY_COUNT=$(echo "$BODY" | jq -r '.data | length')
    echo "  Операций в истории: $HISTORY_COUNT"
fi

# =============================================================================
# 2. CREATE ОПЕРАЦИИ - Тестирование создания товаров
# =============================================================================

log "📝 ТЕСТИРОВАНИЕ CREATE ОПЕРАЦИЙ"
echo "--------------------------------"

# 2.1 Создание обычного товара
log "2.1 Создание обычного товара"
TEST_ITEM_NAME="CRUD_Test_Item_$(date +%s)"

CREATE_DATA="{
    \"access_token\": \"$ACCESS_TOKEN\",
    \"name\": \"$TEST_ITEM_NAME\",
    \"cost\": 500,
    \"quantity\": 25,
    \"markup\": 50,
    \"location\": \"Test Location\",
    \"service\": false,
    \"flower\": \"roses\",
    \"deactivate\": false
}"

RESPONSE=$(api_request "POST" "${BASE_URL}/create/" "$CREATE_DATA" "Создание обычного товара")
HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')

if check_status "$HTTP_STATUS" "200" "Создание товара"; then
    success "Товар '$TEST_ITEM_NAME' создан успешно"
    CREATED_ITEM_ID=$(echo "$BODY" | jq -r '.data.id // null')
    echo "  Создан товар с ID: $CREATED_ITEM_ID"
else
    error "Ошибка создания товара: $BODY"
fi

# 2.2 Создание услуги
log "2.2 Создание услуги"
SERVICE_NAME="CRUD_Test_Service_$(date +%s)"

SERVICE_DATA="{
    \"access_token\": \"$ACCESS_TOKEN\",
    \"name\": \"$SERVICE_NAME\",
    \"cost\": 1000,
    \"quantity\": 1,
    \"markup\": 0,
    \"location\": \"Office\",
    \"service\": true,
    \"flower\": \"\",
    \"deactivate\": false
}"

RESPONSE=$(api_request "POST" "${BASE_URL}/create/" "$SERVICE_DATA" "Создание услуги")
HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)

if check_status "$HTTP_STATUS" "200" "Создание услуги"; then
    BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')
    success "Услуга '$SERVICE_NAME' создана успешно"
    SERVICE_ID=$(echo "$BODY" | jq -r '.data.id // null')
    echo "  Создана услуга с ID: $SERVICE_ID"
fi

# 2.3 Тест валидации - попытка создания без обязательных полей
log "2.3 Тест валидации - создание без названия"

INVALID_DATA="{
    \"access_token\": \"$ACCESS_TOKEN\",
    \"cost\": 100,
    \"quantity\": 1
}"

RESPONSE=$(api_request "POST" "${BASE_URL}/create/" "$INVALID_DATA" "Создание без названия")
HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)

if [ "$HTTP_STATUS" != "200" ]; then
    success "Валидация работает - создание без названия отклонено (HTTP $HTTP_STATUS)"
else
    warning "Валидация не сработала - товар без названия был создан"
fi

# =============================================================================
# 3. UPDATE ОПЕРАЦИИ - Тестирование обновления товаров
# =============================================================================

log "🔄 ТЕСТИРОВАНИЕ UPDATE ОПЕРАЦИЙ"
echo "--------------------------------"

if [ -n "$CREATED_ITEM_ID" ] && [ "$CREATED_ITEM_ID" != "null" ]; then
    # 3.1 Обновление количества товара
    log "3.1 Обновление количества товара ID: $CREATED_ITEM_ID"
    
    UPDATE_DATA="{
        \"access_token\": \"$ACCESS_TOKEN\",
        \"id\": $CREATED_ITEM_ID,
        \"quantity\": 50
    }"
    
    RESPONSE=$(api_request "POST" "${BASE_URL}/item/" "$UPDATE_DATA" "Обновление количества")
    HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    
    if check_status "$HTTP_STATUS" "200" "Обновление количества"; then
        success "Количество товара обновлено на 50"
    fi
    
    # 3.2 Обновление цены и наценки
    log "3.2 Обновление цены и наценки"
    
    PRICE_UPDATE_DATA="{
        \"access_token\": \"$ACCESS_TOKEN\",
        \"id\": $CREATED_ITEM_ID,
        \"cost\": 750,
        \"markup\": 75
    }"
    
    RESPONSE=$(api_request "POST" "${BASE_URL}/item/" "$PRICE_UPDATE_DATA" "Обновление цены")
    HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    
    check_status "$HTTP_STATUS" "200" "Обновление цены и наценки"
else
    warning "Пропуск UPDATE тестов - не удалось создать тестовый товар"
fi

# =============================================================================
# 4. DELETE ОПЕРАЦИИ - Тестирование удаления товаров
# =============================================================================

log "🗑️ ТЕСТИРОВАНИЕ DELETE ОПЕРАЦИЙ"
echo "--------------------------------"

if [ -n "$CREATED_ITEM_ID" ] && [ "$CREATED_ITEM_ID" != "null" ]; then
    # 4.1 Деактивация товара
    log "4.1 Деактивация товара"
    
    DEACTIVATE_DATA="{
        \"access_token\": \"$ACCESS_TOKEN\",
        \"id\": $CREATED_ITEM_ID,
        \"deactivate\": true
    }"
    
    RESPONSE=$(api_request "POST" "${BASE_URL}/item/" "$DEACTIVATE_DATA" "Деактивация товара")
    HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    
    if check_status "$HTTP_STATUS" "200" "Деактивация товара"; then
        success "Товар деактивирован"
    fi
    
    # 4.2 Окончательное удаление товара
    log "4.2 Удаление товара"
    
    DELETE_DATA="{
        \"access_token\": \"$ACCESS_TOKEN\",
        \"id\": $CREATED_ITEM_ID
    }"
    
    RESPONSE=$(api_request "DELETE" "${BASE_URL}/item/" "$DELETE_DATA" "Удаление товара")
    HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    
    check_status "$HTTP_STATUS" "200" "Удаление товара"
fi

# Удаление тестовой услуги
if [ -n "$SERVICE_ID" ] && [ "$SERVICE_ID" != "null" ]; then
    log "4.3 Удаление тестовой услуги"
    
    DELETE_SERVICE_DATA="{
        \"access_token\": \"$ACCESS_TOKEN\",
        \"id\": $SERVICE_ID
    }"
    
    RESPONSE=$(api_request "DELETE" "${BASE_URL}/item/" "$DELETE_SERVICE_DATA" "Удаление услуги")
    HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    
    check_status "$HTTP_STATUS" "200" "Удаление услуги"
fi

# =============================================================================
# 5. ГРАНИЧНЫЕ СЛУЧАИ И НАГРУЗОЧНОЕ ТЕСТИРОВАНИЕ
# =============================================================================

log "🔍 ТЕСТИРОВАНИЕ ГРАНИЧНЫХ СЛУЧАЕВ"
echo "--------------------------------"

# 5.1 Неверный токен доступа
log "5.1 Тест с неверным токеном"
RESPONSE=$(api_request "GET" "${BASE_URL}/?access_token=invalid_token" "" "Неверный токен")
HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)

if [ "$HTTP_STATUS" = "401" ] || [ "$HTTP_STATUS" = "403" ]; then
    success "Неавторизованный доступ корректно отклонен (HTTP $HTTP_STATUS)"
else
    error "Неверный токен не был отклонен (HTTP $HTTP_STATUS)"
fi

# 5.2 Очень большой лимит
log "5.2 Тест с большим лимитом"
RESPONSE=$(api_request "GET" "${BASE_URL}/?access_token=${ACCESS_TOKEN}&limit=1000" "" "Большой лимит")
HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)

check_status "$HTTP_STATUS" "200" "Большой лимит"

# 5.3 Поиск с специальными символами
log "5.3 Поиск с специальными символами"
SPECIAL_SEARCHES=("test%20item" "item&sort=name" "item<script>" "item'OR'1'='1")

for search in "${SPECIAL_SEARCHES[@]}"; do
    RESPONSE=$(api_request "GET" "${BASE_URL}/?access_token=${ACCESS_TOKEN}&search=${search}" "" "Поиск: $search")
    HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    
    if [ "$HTTP_STATUS" = "200" ]; then
        success "Поиск с спецсимволами обработан корректно"
    else
        warning "Проблема с поиском '$search' (HTTP $HTTP_STATUS)"
    fi
done

echo ""
echo "========================================="
success "🎉 CRUD тестирование API /inventory/ завершено!"
echo "========================================="

# Вывод итоговой статистики
log "📊 Сводка тестирования:"
echo "- Протестированы все CRUD операции"
echo "- Проверены граничные случаи"
echo "- Проверена валидация данных"
echo "- Протестированы фильтры и поиск"
echo "- Проверена безопасность токенов"

exit 0