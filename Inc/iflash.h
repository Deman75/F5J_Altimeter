#ifndef __IFLASH_H
#define __IFLASH_H

#include "main.h"

#define FLASH_FNUMB 0x0800F800 // ��������� �� ������ ��� �������� ���������� ����� ����� ����
#define FLASH_FIRSTSTART 0x0800F804
//#define FLASH_THR 0x0800F804
//#define FLASH_RUD 0x0800F806


void Internal_Flash_Write(uint16_t data, unsigned int address); // ������ ���������� �� ���������� ������
uint16_t  Internal_Flash_Read(uint32_t addr); // ������ �� ���������� ������.


#endif /* __IFLASH_H */