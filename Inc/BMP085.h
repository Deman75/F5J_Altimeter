// I2Cdev library collection - BMP085 I2C device class
// Based on register information stored in the I2Cdevlib internal database
// 2012-06-28 by Jeff Rowberg <jeff@rowberg.net>
// Updates should (hopefully) always be available at https://github.com/jrowberg/i2cdevlib
// 2015-06-06 by Andrey Voloshin <voloshin@think.in.ua>
//
// Changelog:
//     2015-06-06 - ported to STM32 HAL library from Arduino code

/* ============================================
I2Cdev device library code is placed under the MIT license
Copyright (c) 2012 Jeff Rowberg

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
===============================================
*/

#ifndef _BMP085_H_
#define _BMP085_H_

#include "main.h"
#include <math.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

typedef uint8_t bool;
#define true 1
#define false 0
extern I2C_HandleTypeDef hi2c1;


#define BMP085_ADDRESS              0x77
#define BMP085_DEFAULT_ADDRESS      BMP085_ADDRESS

#define BMP085_RA_AC1_H     0xAA    /* AC1_H */
#define BMP085_RA_AC1_L     0xAB    /* AC1_L */
#define BMP085_RA_AC2_H     0xAC    /* AC2_H */
#define BMP085_RA_AC2_L     0xAD    /* AC2_L */
#define BMP085_RA_AC3_H     0xAE    /* AC3_H */
#define BMP085_RA_AC3_L     0xAF    /* AC3_L */
#define BMP085_RA_AC4_H     0xB0    /* AC4_H */
#define BMP085_RA_AC4_L     0xB1    /* AC4_L */
#define BMP085_RA_AC5_H     0xB2    /* AC5_H */
#define BMP085_RA_AC5_L     0xB3    /* AC5_L */
#define BMP085_RA_AC6_H     0xB4    /* AC6_H */
#define BMP085_RA_AC6_L     0xB5    /* AC6_L */
#define BMP085_RA_B1_H      0xB6    /* B1_H */
#define BMP085_RA_B1_L      0xB7    /* B1_L */
#define BMP085_RA_B2_H      0xB8    /* B2_H */
#define BMP085_RA_B2_L      0xB9    /* B2_L */
#define BMP085_RA_MB_H      0xBA    /* MB_H */
#define BMP085_RA_MB_L      0xBB    /* MB_L */
#define BMP085_RA_MC_H      0xBC    /* MC_H */
#define BMP085_RA_MC_L      0xBD    /* MC_L */
#define BMP085_RA_MD_H      0xBE    /* MD_H */
#define BMP085_RA_MD_L      0xBF    /* MD_L */
#define BMP085_RA_CONTROL   0xF4    /* CONTROL */
#define BMP085_RA_MSB       0xF6    /* MSB */
#define BMP085_RA_LSB       0xF7    /* LSB */
#define BMP085_RA_XLSB      0xF8    /* XLSB */

#define BMP085_MODE_TEMPERATURE     0x2E
#define BMP085_MODE_PRESSURE_0      0x34
#define BMP085_MODE_PRESSURE_1      0x74
#define BMP085_MODE_PRESSURE_2      0xB4
#define BMP085_MODE_PRESSURE_3      0xF4

void BMP085_initialize(void);
bool BMP085_testConnection(void);

/* calibration register methods */
int16_t     BMP085_getAC1(void);
int16_t     BMP085_getAC2(void);
int16_t     BMP085_getAC3(void);
uint16_t    BMP085_getAC4(void);
uint16_t    BMP085_getAC5(void);
uint16_t    BMP085_getAC6(void);
int16_t     BMP085_getB1(void);
int16_t     BMP085_getB2(void);
int16_t     BMP085_getMB(void);
int16_t     BMP085_getMC(void);
int16_t     BMP085_getMD(void);

/* CONTROL register methods */
uint8_t     BMP085_getControl(void);
void        BMP085_setControl(uint8_t value);

/* MEASURE register methods */
uint16_t    BMP085_getMeasurement2(void); // 16-bit data
uint32_t    BMP085_getMeasurement3(void); // 24-bit data
uint8_t     BMP085_getMeasureDelayMilliseconds(uint8_t mode);
uint16_t    BMP085_getMeasureDelayMicroseconds(uint8_t mode);

// convenience methods
void        BMP085_loadCalibration(void);
uint16_t    BMP085_getRawTemperature(void);
float       BMP085_getTemperatureC(void);
float       BMP085_getTemperatureF(void);
uint32_t    BMP085_getRawPressure(void);
float       BMP085_getPressure(void);
float       BMP085_getAltitude(float pressure, float seaLevelPressure);

float 			GroundAltitude(void);

//I2C

#define I2CDEV_DEFAULT_READ_TIMEOUT     1000

uint8_t I2Cdev_readBytes(uint8_t devAddr, uint8_t regAddr, uint8_t length, uint8_t *data, uint16_t timeout);
uint8_t I2Cdev_readByte(uint8_t devAddr, uint8_t regAddr, uint8_t *data, uint16_t timeout);

uint16_t I2Cdev_writeBytes(uint8_t devAddr, uint8_t regAddr, uint8_t length, uint8_t *data);
uint16_t I2Cdev_writeByte(uint8_t devAddr, uint8_t regAddr, uint8_t data);


#endif /* _BMP085_H_ */
