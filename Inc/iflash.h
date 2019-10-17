#ifndef __IFLASH_H
#define __IFLASH_H

#include "main.h"

#define FLASH_FNUMB 0x0800F800 // указатель на память где хранится порядковый номер файла лога
#define FLASH_FIRSTSTART 0x0800F804
//#define FLASH_THR 0x0800F804
//#define FLASH_RUD 0x0800F806


void Internal_Flash_Write(uint16_t data, unsigned int address); // Запись информации на внутреннюю память
uint16_t  Internal_Flash_Read(uint32_t addr); // Чтение из внутренней памяти.


#endif /* __IFLASH_H */