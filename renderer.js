document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText')
    const outputText = document.getElementById('outputText')
    const dateInput = document.getElementById('dateInput')
    const statusDiv = document.getElementById('status')

    // Кнопки обработки текста
    document.getElementById('removeSpaces').addEventListener('click', () => {
        const text = inputText.value
        const result = text.replace(/\s+/g, '')
        outputText.value = result
        showStatus('Пробелы и переносы строк удалены', 'success')
    })

    document.getElementById('capitalize').addEventListener('click', () => {
        const text = inputText.value
        const result = text
            .split(' ')
            .map((word) => {
                return (
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
            })
            .join(' ')
        outputText.value = result
        showStatus('Первые буквы слов сделаны заглавными', 'success')
    })

    document.getElementById('swapLetters').addEventListener('click', () => {
        const text = inputText.value
        const result = text
            .split(' ')
            .map((word) => {
                if (word.length < 2) return word
                const first = word[0]
                const last = word[word.length - 1]
                return last + word.slice(1, -1) + first
            })
            .join(' ')
        outputText.value = result
        showStatus('Первая и последняя буквы слов поменяны местами', 'success')
    })

    document.getElementById('sortWords').addEventListener('click', () => {
        const text = inputText.value
        const words = text.split(/[ ,.]+/).filter((word) => word.length > 0)
        const sorted = words.sort((a, b) => a.localeCompare(b))
        outputText.value = sorted.join('\n')
        showStatus('Слова отсортированы по алфавиту', 'success')
    })

    document
        .getElementById('saveToFile')
        .addEventListener('click', async () => {
            const text = outputText.value || inputText.value
            if (!text) {
                showStatus('Нет текста для сохранения', 'error')
                return
            }

            try {
                const result = await window.electronAPI.saveToFile(text)
                if (result.success) {
                    outputText.value = `Файл сохранен по пути: ${result.filePath}`
                    showStatus('Файл успешно сохранен', 'success')
                } else {
                    showStatus(
                        `Ошибка при сохранении: ${result.error}`,
                        'error'
                    )
                }
            } catch (error) {
                showStatus(`Ошибка при сохранении: ${error.message}`, 'error')
            }
        })

    // Обработка даты
    document.getElementById('processDate').addEventListener('click', () => {
        const dateStr = dateInput.value.trim()
        if (!dateStr) {
            showStatus('Введите дату', 'error')
            return
        }

        try {
            const [day, month, year] = dateStr.split('.')
            if (
                !day ||
                !month ||
                !year ||
                day.length !== 2 ||
                month.length !== 2 ||
                year.length !== 4
            ) {
                throw new Error('Неверный формат даты')
            }

            const date = new Date(`${year}-${month}-${day}`)
            if (isNaN(date.getTime())) {
                throw new Error('Неверная дата')
            }

            // Форматирование даты
            const formattedDate = `${day}-${month}-${year}`

            // День недели
            const days = [
                'воскресенье',
                'понедельник',
                'вторник',
                'среда',
                'четверг',
                'пятница',
                'суббота',
            ]
            const dayOfWeek = days[date.getDay()]

            // Разница с текущей датой
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const diffTime = Math.abs(date - today)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            outputText.value = `Форматированная дата: ${formattedDate}\nДень недели: ${dayOfWeek}\nРазница с текущей датой: ${diffDays} дней`
            showStatus('Дата успешно обработана', 'success')
        } catch (error) {
            outputText.value = ''
            showStatus(
                `Ошибка: ${error.message}. Введите дату в формате дд.мм.гггг`,
                'error'
            )
        }
    })

    // Работа с папками
    let selectedFolderPath = null

    document
        .getElementById('selectFolder')
        .addEventListener('click', async () => {
            try {
                const folderPath = await window.electronAPI.selectFolder()
                if (folderPath) {
                    selectedFolderPath = folderPath
                    showStatus(`Выбрана папка: ${folderPath}`, 'success')
                }
            } catch (error) {
                showStatus(`Ошибка при выборе папки: ${error.message}`, 'error')
            }
        })

    document
        .getElementById('organizeFiles')
        .addEventListener('click', async () => {
            if (!selectedFolderPath) {
                showStatus('Сначала выберите папку', 'error')
                return
            }

            try {
                const result = await window.electronAPI.organizeFiles(
                    selectedFolderPath
                )
                if (result.success) {
                    showStatus(
                        'Файлы успешно организованы по папкам',
                        'success'
                    )
                } else {
                    showStatus(
                        `Ошибка при организации файлов: ${result.error}`,
                        'error'
                    )
                }
            } catch (error) {
                showStatus(
                    `Ошибка при организации файлов: ${error.message}`,
                    'error'
                )
            }
        })

    document
        .getElementById('cleanFolder')
        .addEventListener('click', async () => {
            if (!selectedFolderPath) {
                showStatus('Сначала выберите папку', 'error')
                return
            }

            try {
                const result = await window.electronAPI.cleanFolder(
                    selectedFolderPath
                )
                if (result.success) {
                    showStatus('Папка успешно очищена', 'success')
                } else {
                    showStatus(
                        `Ошибка при очистке папки: ${result.error}`,
                        'error'
                    )
                }
            } catch (error) {
                showStatus(
                    `Ошибка при очистке папки: ${error.message}`,
                    'error'
                )
            }
        })

    function showStatus(message, type) {
        statusDiv.textContent = message
        statusDiv.className = type
    }
})
